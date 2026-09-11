import { EnergyProject } from '../types/project.js';
import { FinancingRequest, FinanceReadinessSnapshot, FinanceReadinessLevel, FinanceReadinessBreakdown } from '../types/financing.js';
import { ProjectFinancialModel } from '../types/finance.js';

export const financeReadinessService = {
  evaluateReadiness: (
    request: FinancingRequest,
    project?: EnergyProject | null,
    financialModel?: ProjectFinancialModel | null,
    contractsCount: number = 0,
    documentsCount: number = 0
  ): FinanceReadinessSnapshot => {
    const missing: string[] = [];
    const recommended: string[] = [];

    // 1. Technical Readiness (max 15)
    let techScore = 0;
    let techDetails = '';
    if (project?.targetCapacityKw && project.targetCapacityKw > 0) {
      if (project.status !== 'DRAFT' && project.status !== 'ANALYSIS') {
        techScore = 15;
        techDetails = `ظرفیت فنی (${project.targetCapacityKw} کیلووات) و مشخصات فنی ثبت و تایید شده است.`;
      } else {
        techScore = 8;
        techDetails = 'ظرفیت اولیه مشخص است ولی طراحی مهندسی کامل نشده است.';
        missing.push('تکمیل طراحی مهندسی و تایید مشخصات فنی تجهیزات');
      }
    } else {
      techScore = 3;
      techDetails = 'مشخصات فنی و ظرفیت نیروگاه نامشخص است.';
      missing.push('ثبت ظرفیت نامی و دیاگرام فنی اولیه');
    }

    // 2. Financial Model (max 20)
    let finModelScore = 0;
    let finModelDetails = '';
    if (financialModel) {
      if (financialModel.status === 'CALCULATED' || financialModel.status === 'REVIEWED' || financialModel.status === 'LOCKED') {
        finModelScore = 20;
        finModelDetails = `مدل مالی مصوب (${financialModel.modelCode}) دارای سناریوهای بازپرداخت و تحلیل حساسیت است.`;
      } else {
        finModelScore = 12;
        finModelDetails = 'مدل مالی پیش‌نویس موجود است اما محاسبات نهایی نشده است.';
        missing.push('محاسبه و نهایی‌سازی شاخص‌های مالی (NPV، IRR، Payback) در استودیو سناریو');
      }
    } else if (request.totalProjectCost > 0) {
      finModelScore = 8;
      finModelDetails = 'برآورد اولیه سرمایه‌گذاری ثبت شده اما مدل مالی تفصیلی الصاق نشده است.';
      missing.push('ایجاد مدل مالی تفصیلی و بررسی جریان وجوه نقد');
    } else {
      missing.push('عدم وجود مدل مالی و برآورد هزینه‌های سرمایه‌ای');
      finModelDetails = 'مدل مالی برای پروژه یافت نشد.';
    }

    // 3. Revenue Visibility (max 15)
    let revScore = 0;
    let revDetails = '';
    switch (request.projectRevenueModel) {
      case 'PPA':
        revScore = 15;
        revDetails = 'قرارداد خرید تضمینی برق (PPA) بالاترین درجه اطمینان درآمدی را فراهم می‌آورد.';
        break;
      case 'SELF_CONSUMPTION':
        revScore = 13;
        revDetails = 'کاهش هزینه برق مصرفی با اتکا به مصرف مستقیم با درجه پیش‌بینی‌پذیری بالا.';
        break;
      case 'GRID_EXPORT':
        revScore = 12;
        revDetails = 'فروش به شبکه بر اساس تعرفه‌های مصوب یا تابلوی سبز بورس انرژی.';
        break;
      case 'MIXED':
        revScore = 11;
        revDetails = 'مدل درآمدی ترکیبی (خودمصرفی + عرضه به شبکه).';
        break;
      default:
        revScore = 5;
        revDetails = 'مدل درآمدی نامشخص یا وابسته به ارزش ذخیره است.';
        missing.push('تعیین و مستندسازی مدل درآمدی و قیمت فروش انرژی');
    }

    // 4. EPC / Contract Readiness (max 10)
    let epcScore = 0;
    let epcDetails = '';
    if (contractsCount > 0) {
      epcScore = 10;
      epcDetails = 'قرارداد EPC یا موافقت‌نامه اجرایی معتبر ثبت شده است.';
    } else if (project?.status === 'CONTRACTING' || project?.status === 'EPC_SELECTED') {
      epcScore = 7;
      epcDetails = 'پیمانکار انتخاب شده و قرارداد در مرحله مذاکره و پیش‌نویس است.';
      missing.push('ثبت نهایی و امضای قرارداد EPC');
    } else {
      epcScore = 3;
      epcDetails = 'پیمانکار EPC مشخص نشده است.';
      missing.push('استعلام یا تعیین پیمانکار ساخت و نصب');
    }

    // 5. Land / Site Documentation (max 10)
    let landScore = 0;
    let landDetails = '';
    if (project?.site?.areaM2 && project.site.areaM2 > 0) {
      landScore = 10;
      landDetails = `محل اجرای پروژه (${project.site.type} به مساحت ${project.site.areaM2} مترمربع) تایید شده است.`;
    } else {
      landScore = 4;
      landDetails = 'اطلاعات زمین یا سازه استقرار کامل نیست.';
      missing.push('ارائه مستندات تاییدیه زمین یا مالکیت محل نصب');
    }

    // 6. Permits / Grid Connection (max 10)
    let permitScore = 0;
    let permitDetails = '';
    if (project?.energyRequirement?.gridConnected) {
      permitScore = 10;
      permitDetails = 'اتصال به شبکه امکان‌پذیر است و بررسی‌های اولیه شبکه انجام شده است.';
    } else {
      permitScore = 6;
      permitDetails = 'استعلام تاییدیه اتصال به شبکه نیازمند پیگیری رسمی است.';
      missing.push('اخذ موافقت اولیه اتصال به شبکه برق');
    }

    // 7. Sponsor Contribution / Equity (max 10)
    let sponsorScore = 0;
    let sponsorDetails = '';
    const equityPercent = request.totalProjectCost > 0 ? (request.ownerEquity / request.totalProjectCost) * 100 : 0;
    if (equityPercent >= 30) {
      sponsorScore = 10;
      sponsorDetails = `آورده نقدی کارفرما (${equityPercent.toFixed(1)}٪) منطبق با الزامات نهادهای مالی است.`;
    } else if (equityPercent >= 15) {
      sponsorScore = 7;
      sponsorDetails = `سهم آورده کارفرما (${equityPercent.toFixed(1)}٪) زیر سقف بهینه ۳۰ درصدی است.`;
      missing.push('افزایش سهم سرمایه آورده کارفرما به حداقل ۳۰٪ کل پروژه');
    } else {
      sponsorScore = 3;
      sponsorDetails = `آورده کارفرما کمتر از ۱۵٪ است که ریسک اهرم مالی را افزایش می‌دهد.`;
      missing.push('تامین حداقل سهم آورده متقاضی جهت پذیرش توسط بانک');
    }

    // 8. Data Room Completeness (max 10)
    let dataRoomScore = 0;
    let dataRoomDetails = '';
    if (documentsCount >= 4) {
      dataRoomScore = 10;
      dataRoomDetails = `اتاق اطلاعات پروژه حاوی ${documentsCount} سند بارگذاری‌شده است.`;
    } else if (documentsCount >= 1) {
      dataRoomScore = 6;
      dataRoomDetails = `تنها ${documentsCount} سند بارگذاری شده است. نهادهای مالی نیاز به مطالعه مستندات بیشتری دارند.`;
      missing.push('بارگذاری اسناد تکمیلی (مجوزها، دیاگرام الکتریکال، اسناد هویتی) در اتاق اسناد');
    } else {
      dataRoomScore = 2;
      dataRoomDetails = 'اتاق داده پروژه فاقد اسناد معتبر است.';
      missing.push('ایجاد پرونده الکترونیک و آپلود اسناد در اتاق داده (Data Room)');
    }

    const totalScore = techScore + finModelScore + revScore + epcScore + landScore + permitScore + sponsorScore + dataRoomScore;

    let level: FinanceReadinessLevel = 'EARLY';
    if (totalScore >= 80) {
      level = 'READY_FOR_PARTNER_REVIEW';
      recommended.push('پروژه آماده ثبت و ارسال درخواست برای نهادهای مالی همکار است.');
    } else if (totalScore >= 60) {
      level = 'FINANCE_PREPARED';
      recommended.push('پروژه از نظر مدارک پایه خوب است؛ با تکمیل موارد باقیمانده شانس دریافت پیشنهاد با شرایط بهتر افزایش می‌یابد.');
    } else if (totalScore >= 40) {
      level = 'PREPARATION_REQUIRED';
      recommended.push('قبل از ارسال رسمی به شرکای مالی، رفع نواقص اصلی و بارگذاری اسناد ضروری است.');
    } else {
      level = 'EARLY';
      recommended.push('پروژه در مراحل اولیه است. پیشنهاد می‌شود ابتدا فاز مهندسی و مدل مالی نهایی شوند.');
    }

    const breakdown: FinanceReadinessBreakdown = {
      technicalReadiness: { score: techScore, max: 15, details: techDetails },
      financialModel: { score: finModelScore, max: 20, details: finModelDetails },
      revenueVisibility: { score: revScore, max: 15, details: revDetails },
      epcContractReadiness: { score: epcScore, max: 10, details: epcDetails },
      landSiteDocumentation: { score: landScore, max: 10, details: landDetails },
      permitsGrid: { score: permitScore, max: 10, details: permitDetails },
      sponsorContribution: { score: sponsorScore, max: 10, details: sponsorDetails },
      dataRoomCompleteness: { score: dataRoomScore, max: 10, details: dataRoomDetails },
    };

    return {
      id: `FRS-${Date.now()}`,
      financingRequestId: request.id,
      projectId: request.projectId,
      totalScore,
      level,
      breakdown,
      missingRequirements: missing,
      recommendedActions: recommended,
      evaluatedAt: new Date().toISOString()
    };
  }
};
