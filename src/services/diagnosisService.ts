import { maintenanceRepository } from '../repositories/maintenanceRepository.js';
import { assetRepository } from '../repositories/assetRepository.js';
import { monitoringRepository } from '../repositories/monitoringRepository.js';
import {
  MaintenanceDiagnosis,
  DiagnosisRootCause,
  DiagnosisAction,
  WarrantyImpact,
  DiagnosisMethod
} from '../types/maintenance.js';
import { GoogleGenAI } from '@google/genai';

let geminiClient: GoogleGenAI | null = null;
function getGeminiClient(): GoogleGenAI | null {
  if (!geminiClient && process.env.GEMINI_API_KEY) {
    try {
      geminiClient = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
    } catch (e) {
      console.warn('Failed to initialize Gemini client:', e);
      geminiClient = null;
    }
  }
  return geminiClient;
}

export const diagnosisService = {
  /**
   * Generates evidence-based diagnosis for an asset / alert
   */
  generateDiagnosis: async (params: {
    assetId: string;
    alertId?: string;
    componentId?: string;
    symptoms?: string[];
    triggerAiAssisted?: boolean;
  }): Promise<MaintenanceDiagnosis> => {
    const { assetId, alertId, componentId, triggerAiAssisted } = params;

    const asset = assetRepository.getAssetById(assetId);
    if (!asset) {
      throw new Error('دارایی انرژی مورد نظر یافت نشد.');
    }
    const projectId = asset.projectId;

    let alert = alertId ? maintenanceRepository.getAlertById(alertId) : undefined;
    const collectedSymptoms: string[] = [...(params.symptoms || [])];

    if (alert) {
      collectedSymptoms.push(`${alert.title}: ${alert.description}`);
      if (alert.metricType) {
        collectedSymptoms.push(`متریک درگیر: ${alert.metricType} (مقدار: ${alert.metricValue ?? 'نامشخص'})`);
      }
    }

    // 1. Check Warranties
    const dbWarranties = assetRepository.getEquipmentWarranties(assetId);
    const passportWarranties = (asset as any).equipmentPassport?.warranties || [];
    const warranties = dbWarranties.length > 0 ? dbWarranties : passportWarranties;

    let warrantyImpact: WarrantyImpact = {
      hasWarrantyCoverage: false,
      warrantyNotes: 'اطلاعات گارانتی در دسترس نیست یا دوره گارانتی منقضی شده است.'
    };

    const activeWarranty = warranties.find((w: any) => {
      if (w.status !== 'ACTIVE') return false;
      if (componentId && w.componentId === componentId) return true;
      return true; // general asset warranty
    });

    if (activeWarranty) {
      warrantyImpact = {
        hasWarrantyCoverage: true,
        warrantyId: activeWarranty.id,
        warrantyType: activeWarranty.warrantyType || activeWarranty.equipmentType,
        warrantyStatus: activeWarranty.status,
        claimProcedure: activeWarranty.claimProcedure || 'ثبت درخواست گارانتی از طریق فرم رسمی سازنده و تحویل به پیمانکار EPC',
        warrantyNotes: `تحت پوشش گارانتی معتبر (${activeWarranty.coverageSummary || activeWarranty.terms}) تا تاریخ ${activeWarranty.endDate}`
      };
    }

    // 2. Fetch Recent Telemetry & Context
    const recentReadings = monitoringRepository.getTelemetryReadings(assetId);
    const hasTelemetryData = recentReadings.length > 0;

    // 3. Evidence-Based Root Cause & Action Derivation
    const symptomsText = collectedSymptoms.join(' ').toLowerCase();
    const likelyRootCauses: DiagnosisRootCause[] = [];
    const recommendedActions: DiagnosisAction[] = [];
    let confidenceScore = 80;

    const isBatteryRelated = symptomsText.includes('battery') || symptomsText.includes('soc') || symptomsText.includes('باتری') || alert?.metricType === 'BATTERY_SOC';
    const isTempRelated = symptomsText.includes('temperature') || symptomsText.includes('دما') || symptomsText.includes('حرارت') || alert?.metricType === 'MODULE_TEMPERATURE';
    const isPerformanceDrop = symptomsText.includes('performance') || symptomsText.includes('افت') || symptomsText.includes('تولید') || alert?.metricType === 'PERFORMANCE_DEVIATION' || alert?.metricType === 'PERFORMANCE_RATIO';
    const isGridRelated = symptomsText.includes('frequency') || symptomsText.includes('voltage') || symptomsText.includes('فرکانس') || symptomsText.includes('ولتاژ') || alert?.metricType === 'FREQUENCY' || alert?.metricType === 'VOLTAGE';
    const isTelemetryLoss = symptomsText.includes('loss') || symptomsText.includes('مفقودی') || symptomsText.includes('قطع ارتباط') || alert?.source === 'TELEMETRY_LOSS';

    if (isBatteryRelated) {
      likelyRootCauses.push(
        { cause: 'خرابی سلول باتری یا افت ظرفیت چرخه شارژ (SOH Degradation)', probability: 0.60, description: 'کاهش نرخ پذیرش شارژ یا اتصال کوتاه داخلی در یکی از بلوک‌های باتری' },
        { cause: 'تنظیمات نادرست شارژر یا اختلال سیستم مدیریت باتری (BMS Cutoff)', probability: 0.25, description: 'قطع پیش از موعد رله شارژ به دلیل قرائت اشتباه دمای باتری' },
        { cause: 'اضافه‌بار مصرفی خارج از منحنی دشارژ استاندارد', probability: 0.15, description: 'تغذیه بارهای سنگین برنامه‌ریزی‌نشده' }
      );
      recommendedActions.push(
        { action: 'تست ظرفیت و اندازه‌گیری ولتاژ تک‌تک سلول‌های بانک باتری زیر بار فرضی', priority: 'CRITICAL', estimatedCostIrr: 15000000, estimatedHours: 3 },
        { action: 'بررسی تنظیمات آستانه ولتاژ قطع و پارامترهای ارتباطی BMS', priority: 'HIGH', estimatedCostIrr: 5000000, estimatedHours: 2 }
      );
      confidenceScore = 88;
    } else if (isTempRelated) {
      likelyRootCauses.push(
        { cause: 'انسداد مسیر هوارسانی و عدم گردش طبیعی هوا در زیر ماژول‌ها', probability: 0.50, description: 'تجمع ضایعات یا طراحی نامناسب فاصله استراکچر تا سطح زمین' },
        { cause: 'ایجاد نقطه داغ (Hotspot) ناشی از ترک مویی یا سایه موضعی', probability: 0.35, description: 'جریان معکوس و داغ شدن بای‌پس دیودهای معیوب' },
        { cause: 'افزایش شدید دمای محیطی فراتر از نقطه تحمل ماژول', probability: 0.15, description: 'تاثیر ضریب دمایی توان (Pmax Temp Coefficient)' }
      );
      recommendedActions.push(
        { action: 'انجام بازرسی و آزمون ترموگرافی مادون قرمز (IR Thermography) بر روی استرینگ‌ها', priority: 'HIGH', estimatedCostIrr: 25000000, estimatedHours: 4 },
        { action: 'بررسی جریان خروجی دیودهای هرزگرد (Bypass Diodes) جعبه تقسیم ماژول', priority: 'MEDIUM', estimatedCostIrr: 10000000, estimatedHours: 2 }
      );
      confidenceScore = 85;
    } else if (isPerformanceDrop) {
      likelyRootCauses.push(
        { cause: 'انباشت گرد و غبار، ذرات صنعتی یا رسوب بر سطح شیشه ماژول‌ها (Soiling)', probability: 0.45, description: 'کاهش تابش موثر ورودی به سلول‌ها' },
        { cause: 'سوختگی فیوز DC یا قطعی در کابل‌کشی استرینگ‌ها', probability: 0.30, description: 'از مدار خارج شدن یک یا چند استرینگ اینورتر' },
        { cause: 'انحراف عملکرد و خطای ردیاب نقطه حداکثر توان (MPPT Inverter Error)', probability: 0.25, description: 'عدم تطابق امپدانس ورودی اینورتر' }
      );
      recommendedActions.push(
        { action: 'شستشوی مکانیزه و استاندارد پنل‌ها با آب تصفیه شده بدون املاح', priority: 'HIGH', estimatedCostIrr: 20000000, estimatedHours: 5 },
        { action: 'اندازه‌گیری ولتاژ مدار باز (Voc) و جریان نامی (Isc) تک‌تک استرینگ‌ها', priority: 'HIGH', estimatedCostIrr: 12000000, estimatedHours: 3 }
      );
      confidenceScore = 82;
    } else if (isGridRelated) {
      likelyRootCauses.push(
        { cause: 'نوسانات ولتاژ شبکه توزیع و فعال‌شدن حفاظت ضدجزیره‌ای اینورتر', probability: 0.65, description: 'تغییرات بار لحظه‌ای پست برق بالادست' },
        { cause: 'کالیبره نبودن سنسورهای ولتاژ یا تنظیمات رله حفاظتی اینورتر', probability: 0.35, description: 'محدوده مجاز تعریف‌شده تنگ‌تر از استانداردهای توانیر' }
      );
      recommendedActions.push(
        { action: 'نصب پاور آنالایزر جهت ثبت هارمونیک و نوسانات ولتاژ در نقطه اتصال به شبکه (PCC)', priority: 'HIGH', estimatedCostIrr: 18000000, estimatedHours: 4 },
        { action: 'هماهنگی با اداره برق منطقه و تنظیم مجدد فریم‌های حفاظتی اینورتر', priority: 'MEDIUM', estimatedCostIrr: 5000000, estimatedHours: 2 }
      );
      confidenceScore = 80;
    } else if (isTelemetryLoss) {
      likelyRootCauses.push(
        { cause: 'قطعی تغذیه یا آسیب به منبع تغذیه مودم / دیتالاگر خورشیدی', probability: 0.55, description: 'نوسان برق ورودی یا اتمام باتری پشتیبان گیت‌وی' },
        { cause: 'آسیب فیزیکی به کابل شبکه یا کابل شیلددار رابط RS-485', probability: 0.35, description: 'خوردگی یا قطعی فیزیکی کابل' },
        { cause: 'اختلال در سیم‌کارت یا آنتن‌دهی اپراتور مخابراتی در سایت', probability: 0.10, description: 'ضعف سیگنال رادیویی' }
      );
      recommendedActions.push(
        { action: 'بازدید میدانی از تابلوی مانیتورینگ و تست چراغ‌های وضعیت PWR / LINK دیتالاگر', priority: 'HIGH', estimatedCostIrr: 8000000, estimatedHours: 2 },
        { action: 'تست پیوستگی سیگنال خط فیزیکی RS485 با مولتی‌متر', priority: 'MEDIUM', estimatedCostIrr: 6000000, estimatedHours: 1.5 }
      );
      confidenceScore = 85;
    } else {
      // General or insufficient symptoms
      if (!hasTelemetryData && collectedSymptoms.length === 0) {
        likelyRootCauses.push({
          cause: 'اطلاعات کافی جهت تشخیص دقیق وجود ندارد (INSUFFICIENT_DATA)',
          probability: 1.0,
          description: 'هیچ داده تله‌متری یا شواهد عملکردی برای این دارایی ثبت نشده است.'
        });
        recommendedActions.push({
          action: 'اتصال منابع تله‌متری فعال یا ثبت گزارش بازدید چشمی تکنسین',
          priority: 'MEDIUM',
          estimatedCostIrr: 0,
          estimatedHours: 1
        });
        confidenceScore = 15;
      } else {
        likelyRootCauses.push(
          { cause: 'بررسی عمومی تجهیزات، افت راندمان سیستم فتوولتائیک یا استهلاک طبیعی', probability: 0.70, description: 'نیاز به پایش جامع‌تر جریان و ولتاژ' },
          { cause: 'اتصالات سست در ترمینال‌های تابلوهای AC/DC', probability: 0.30, description: 'افزایش مقاومت تماسی' }
        );
        recommendedActions.push(
          { action: 'اجرای چک‌لیست کامل سرویس و نگهداری پیشگیرانه (PM)', priority: 'MEDIUM', estimatedCostIrr: 20000000, estimatedHours: 4 }
        );
        confidenceScore = 65;
      }
    }

    // 4. Optional AI Enrichment Layer
    let diagnosisMethod: DiagnosisMethod = 'EXPERT_RULESET';
    let rawAiResponse: string | undefined = undefined;

    const ai = getGeminiClient();
    if (ai && triggerAiAssisted !== false) {
      try {
        const prompt = `شما یک مهندس ارشد و کارشناس عیب‌یابی نیروگاه‌های خورشیدی و سیستم‌های انرژی تجدیدپذیر هستید.
اطلاعات دارایی:
- نام و نوع دارایی: ${asset.name || asset.assetCode} (${asset.assetType})
- ظرفیت نصب شده: ${asset.installedCapacityKw} کیلووات
- نشانه‌ها و هشدارهای دریافتی: ${collectedSymptoms.join(' | ') || 'بررسی وضعیت عمومی'}
- وضعیت گارانتی تجهیزات: ${warrantyImpact.hasWarrantyCoverage ? 'دارد: ' + warrantyImpact.warrantyNotes : 'ندارد'}

بر اساس این شواهد، لطفاً تحلیل فنی علت ریشه‌ای و ۳ اقدام پیشنهادی دارای اولویت را ارائه دهید.
پاسخ را خلاصه، تخصصی و به زبان فارسی بنویسید.`;

        const aiPromise = ai.models.generateContent({
          model: 'gemini-flash-latest',
          contents: prompt
        });

        const timeoutPromise = new Promise<null>((_, reject) =>
          setTimeout(() => reject(new Error('AI generation timeout')), 3000)
        );

        const response: any = await Promise.race([aiPromise, timeoutPromise]);

        if (response && response.text) {
          rawAiResponse = response.text;
          diagnosisMethod = 'AI_ASSISTED';
          confidenceScore = Math.min(95, confidenceScore + 5);
        }
      } catch (aiErr) {
        console.warn('Gemini diagnosis enrichment skipped or timed out:', aiErr);
        // Fallback remains EXPERT_RULESET
      }
    }

    const created = maintenanceRepository.createDiagnosis({
      alertId,
      assetId,
      projectId,
      componentId,
      symptoms: collectedSymptoms,
      rootCauses: likelyRootCauses,
      likelyRootCauses,
      actions: recommendedActions,
      recommendedActions,
      confidenceScore,
      warrantyImpact,
      diagnosisMethod,
      rawAiResponse
    });

    return created;
  },

  /**
   * Convenience alias to diagnose an alert directly by alert ID
   */
  diagnoseAlert: async (
    alertId: string,
    options?: { triggerAiAssisted?: boolean; symptoms?: string[] }
  ): Promise<MaintenanceDiagnosis> => {
    const alert = maintenanceRepository.getAlertById(alertId);
    if (!alert) {
      throw new Error(`هشدار با شناسه ${alertId} یافت نشد.`);
    }

    return diagnosisService.generateDiagnosis({
      assetId: alert.assetId,
      alertId: alert.id,
      componentId: alert.componentId,
      symptoms: options?.symptoms,
      triggerAiAssisted: options?.triggerAiAssisted
    });
  }
};
