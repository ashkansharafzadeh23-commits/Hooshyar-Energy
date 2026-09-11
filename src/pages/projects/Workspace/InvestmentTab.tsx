import React, { useState, useEffect } from 'react';
import { EnergyProject } from '../../../types/project';
import { InvestmentOpportunity, ProjectReadinessScore } from '../../../types/investment';
import { 
  Loader2, 
  TrendingUp, 
  ShieldCheck, 
  DollarSign, 
  Users, 
  CheckCircle, 
  AlertCircle, 
  Share2, 
  FileText, 
  ExternalLink,
  Lock,
  PieChart,
  Plus
} from 'lucide-react';
import { Link } from 'react-router-dom';

interface InvestmentTabProps {
  project: EnergyProject;
}

export const InvestmentTab: React.FC<InvestmentTabProps> = ({ project }) => {
  const [opportunity, setOpportunity] = useState<InvestmentOpportunity | null>(null);
  const [readiness, setReadiness] = useState<ProjectReadinessScore | null>(null);
  const [financialModel, setFinancialModel] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showSetupModal, setShowSetupModal] = useState(false);

  // Form states
  const [partnerEquityGapPercent, setPartnerEquityGapPercent] = useState<number>(70);
  const [minCapitalMillionToman, setMinCapitalMillionToman] = useState<number>(500);
  const [partnerType, setPartnerType] = useState<string>('شرکت سرمایه‌گذاری یا شریک صنعتی');

  useEffect(() => {
    fetchInvestmentData();
  }, [project.id]);

  const fetchInvestmentData = async () => {
    setLoading(true);
    try {
      // 1. Fetch opportunity
      const oppRes = await fetch(`/api/investment/projects/${project.id}/opportunity`);
      if (oppRes.ok) {
        const oppData = await oppRes.json();
        setOpportunity(oppData);
      }

      // 2. Fetch readiness
      const readyRes = await fetch(`/api/investment/projects/${project.id}/readiness`);
      if (readyRes.ok) {
        const readyData = await readyRes.json();
        setReadiness(readyData);
      }

      // 3. Fetch financial model for capex
      const finRes = await fetch(`/api/projects/${project.id}/financial-models`);
      if (finRes.ok) {
        const finData = await finRes.json();
        if (finData.length > 0) {
          setFinancialModel(finData[0]);
        }
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handlePublishOpportunity = async () => {
    setSaving(true);
    try {
      const totalCapexToman = financialModel?.results?.totalCapex?.amount 
        || (project.estimatedBudget?.amount ? project.estimatedBudget.amount / 10 : 2500000000);
      
      const capitalRequired = Math.round(totalCapexToman * (partnerEquityGapPercent / 100));
      const ownerEquity = totalCapexToman - capitalRequired;

      const oppPayload = {
        title: `فرصت مشارکت و سرمایه‌گذاری: احداث نیروگاه ${project.targetCapacityKw || ''} کیلوواتی ${project.location?.city || ''}`,
        summary: `پروژه خورشیدی دارای زمین و مطالعات امکان‌سنجی در استان ${project.location?.province || ''} نیازمند شریک سرمایه‌گذار جهت احداث و بهره‌برداری تجاری`,
        type: 'PROJECT_SEEKING_CAPITAL',
        status: 'PUBLISHED',
        visibility: 'PUBLIC_SUMMARY',
        projectStage: project.status,
        targetCapacityKw: project.targetCapacityKw,
        location: {
          province: project.location?.province || 'نامشخص',
          city: project.location?.city || 'نامشخص'
        },
        landStatus: project.site?.type ? 'OWNED' : 'UNKNOWN',
        permitStatus: 'IN_PROGRESS',
        gridConnectionStatus: project.energyRequirement?.gridConnected ? 'APPROVED' : 'REQUESTED',
        engineeringStatus: 'IN_PROGRESS',
        financialModelStatus: financialModel ? 'COMPLETE' : 'IN_PROGRESS',
        epcStatus: project.status === 'EPC_SELECTED' ? 'SELECTED' : 'NOT_STARTED',
        capitalRequirement: {
          totalProjectCapex: totalCapexToman,
          ownerEquity: ownerEquity,
          capitalRequired: capitalRequired
        },
        minimumPartnerCapital: minCapitalMillionToman * 1000000,
        preferredPartnerType: partnerType
      };

      const res = await fetch(`/api/investment/projects/${project.id}/opportunity`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(oppPayload)
      });

      if (res.ok) {
        setShowSetupModal(false);
        await fetchInvestmentData();
      }
    } catch (e) {
      console.error(e);
    } finally {
      setSaving(false);
    }
  };

  const formatMoney = (toman: number) => {
    return (toman / 1000000).toLocaleString('fa-IR', { maximumFractionDigits: 0 }) + ' میلیون تومان';
  };

  if (loading) {
    return (
      <div className="p-12 flex justify-center font-Vazirmatn">
        <Loader2 className="animate-spin text-blue-600" size={32} />
      </div>
    );
  }

  const totalCapex = opportunity?.capitalRequirement?.totalProjectCapex 
    || financialModel?.results?.totalCapex?.amount 
    || 2500000000;
  
  const capitalRequired = opportunity?.capitalRequirement?.capitalRequired 
    || Math.round(totalCapex * 0.7);

  const ownerEquity = opportunity?.capitalRequirement?.ownerEquity 
    || (totalCapex - capitalRequired);

  return (
    <div className="space-y-8 font-Vazirmatn">
      {/* Top Banner */}
      <div className="flex flex-wrap justify-between items-center bg-white p-6 rounded-2xl shadow-sm border border-gray-200 gap-4">
        <div>
          <div className="flex items-center gap-3">
            <h2 className="text-xl font-bold text-gray-900">هاب سرمایه‌گذاری و جذب شریک (Investment Hub)</h2>
            {opportunity ? (
              <span className="px-2.5 py-1 bg-emerald-50 text-emerald-700 border border-emerald-200 text-xs font-bold rounded-lg flex items-center gap-1">
                <CheckCircle size={14} />
                منتشر شده در بازار فرصت‌ها ({opportunity.opportunityCode})
              </span>
            ) : (
              <span className="px-2.5 py-1 bg-amber-50 text-amber-700 border border-amber-200 text-xs font-bold rounded-lg">
                هنوز در بازار منتشر نشده است
              </span>
            )}
          </div>
          <p className="text-sm text-gray-500 mt-1">
            ارزیابی آمادگی پروژه، ساختار سرمایه‌گذاری و اتصال به سرمایه‌گذاران معتبر صنعتی و نهادی B2B
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setShowSetupModal(true)}
            className="px-5 py-2.5 bg-blue-600 text-white rounded-xl text-sm font-bold hover:bg-blue-700 transition-colors shadow-sm flex items-center gap-2"
          >
            {opportunity ? 'ویرایش شرایط جذب سرمایه' : 'انتشار پروژه در بازار سرمایه‌گذاری'}
          </button>
          
          <Link
            to="/investment-hub"
            target="_blank"
            className="px-4 py-2.5 bg-gray-100 text-gray-700 rounded-xl text-sm font-bold hover:bg-gray-200 flex items-center gap-1.5 border border-gray-300"
          >
            <ExternalLink size={16} />
            مرکز کل فرصت‌ها
          </Link>
        </div>
      </div>

      {/* Project Readiness Gauge / Breakdown */}
      {readiness && (
        <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm">
          <div className="flex flex-wrap justify-between items-center mb-6 pb-4 border-b border-gray-100 gap-4">
            <div>
              <h3 className="font-bold text-gray-900 text-base flex items-center gap-2">
                <ShieldCheck className="text-blue-600" size={20} />
                شاخص آمادگی جذب سرمایه (Project Readiness Score)
              </h3>
              <p className="text-xs text-gray-500 mt-0.5">
                سرمایه‌گذاران تخصصی پروژه‌های با شاخص آمادگی بالای ۷۰٪ را ترجیح می‌دهند.
              </p>
            </div>

            <div className="flex items-center gap-3">
              <span className="text-sm text-gray-500">امتیاز کل آمادگی:</span>
              <span className={`text-2xl font-black px-4 py-1.5 rounded-xl border ${
                readiness.overallScore >= 70 ? 'bg-emerald-50 text-emerald-700 border-emerald-200' :
                readiness.overallScore >= 50 ? 'bg-blue-50 text-blue-700 border-blue-200' :
                'bg-amber-50 text-amber-700 border-amber-200'
              }`}>
                {readiness.overallScore}٪
              </span>
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4 text-xs">
            <div className="bg-gray-50 p-3.5 rounded-xl border border-gray-100">
              <span className="text-gray-500 block mb-1">زمین و حقوق ملک</span>
              <span className="font-bold text-gray-900 text-sm">{readiness.breakdown.land}٪</span>
              <div className="w-full bg-gray-200 h-1.5 rounded-full mt-2 overflow-hidden">
                <div className="bg-blue-600 h-full" style={{ width: `${readiness.breakdown.land}%` }}></div>
              </div>
            </div>

            <div className="bg-gray-50 p-3.5 rounded-xl border border-gray-100">
              <span className="text-gray-500 block mb-1">طراحی فنی و مهندسی</span>
              <span className="font-bold text-gray-900 text-sm">{readiness.breakdown.technical}٪</span>
              <div className="w-full bg-gray-200 h-1.5 rounded-full mt-2 overflow-hidden">
                <div className="bg-blue-600 h-full" style={{ width: `${readiness.breakdown.technical}%` }}></div>
              </div>
            </div>

            <div className="bg-gray-50 p-3.5 rounded-xl border border-gray-100">
              <span className="text-gray-500 block mb-1">اتصال به شبکه برق</span>
              <span className="font-bold text-gray-900 text-sm">{readiness.breakdown.grid}٪</span>
              <div className="w-full bg-gray-200 h-1.5 rounded-full mt-2 overflow-hidden">
                <div className="bg-blue-600 h-full" style={{ width: `${readiness.breakdown.grid}%` }}></div>
              </div>
            </div>

            <div className="bg-gray-50 p-3.5 rounded-xl border border-gray-100">
              <span className="text-gray-500 block mb-1">مجوزها و استعلامات</span>
              <span className="font-bold text-gray-900 text-sm">{readiness.breakdown.permit}٪</span>
              <div className="w-full bg-gray-200 h-1.5 rounded-full mt-2 overflow-hidden">
                <div className="bg-blue-600 h-full" style={{ width: `${readiness.breakdown.permit}%` }}></div>
              </div>
            </div>

            <div className="bg-gray-50 p-3.5 rounded-xl border border-gray-100">
              <span className="text-gray-500 block mb-1">مدل مالی و توجیهی</span>
              <span className="font-bold text-gray-900 text-sm">{readiness.breakdown.financial}٪</span>
              <div className="w-full bg-gray-200 h-1.5 rounded-full mt-2 overflow-hidden">
                <div className="bg-blue-600 h-full" style={{ width: `${readiness.breakdown.financial}%` }}></div>
              </div>
            </div>

            <div className="bg-gray-50 p-3.5 rounded-xl border border-gray-100">
              <span className="text-gray-500 block mb-1">پیمانکار اجرایی EPC</span>
              <span className="font-bold text-gray-900 text-sm">{readiness.breakdown.epc}٪</span>
              <div className="w-full bg-gray-200 h-1.5 rounded-full mt-2 overflow-hidden">
                <div className="bg-blue-600 h-full" style={{ width: `${readiness.breakdown.epc}%` }}></div>
              </div>
            </div>
          </div>

          {readiness.missingItems && readiness.missingItems.length > 0 && (
            <div className="mt-4 p-3.5 bg-amber-50 rounded-xl border border-amber-200 text-xs text-amber-800 space-y-1">
              <span className="font-bold block mb-1">اقدامات لازم برای افزایش امتیاز آمادگی:</span>
              {readiness.missingItems.map((item, idx) => (
                <div key={idx} className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 bg-amber-600 rounded-full"></span>
                  <span>{item}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Capital Structure Breakdown Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm">
          <div className="text-xs text-gray-500 font-bold mb-2 flex items-center gap-1.5">
            <DollarSign size={16} className="text-blue-600" />
            کل سرمایه مورد نیاز طرح (CAPEX)
          </div>
          <div className="text-2xl font-black text-gray-900">{formatMoney(totalCapex)}</div>
          <p className="text-xs text-gray-400 mt-2">بر اساس برآورد مدل مالی و پیشنهاد پیمانکار</p>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm">
          <div className="text-xs text-gray-500 font-bold mb-2 flex items-center gap-1.5">
            <PieChart size={16} className="text-emerald-600" />
            آورده کارفرما / ارزش زمین و مجوز
          </div>
          <div className="text-2xl font-black text-emerald-700">{formatMoney(ownerEquity)}</div>
          <p className="text-xs text-gray-400 mt-2">
            معادل {Math.round((ownerEquity / totalCapex) * 100)}٪ از کل ارزش طرح
          </p>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm">
          <div className="text-xs text-gray-500 font-bold mb-2 flex items-center gap-1.5">
            <Users size={16} className="text-indigo-600" />
            سرمایه مورد نیاز از شریک (Funding Gap)
          </div>
          <div className="text-2xl font-black text-indigo-700">{formatMoney(capitalRequired)}</div>
          <p className="text-xs text-gray-400 mt-2">
            حداقل آورده هر شریک: {formatMoney(opportunity?.minimumPartnerCapital || minCapitalMillionToman * 1000000)}
          </p>
        </div>
      </div>

      {/* Strict Regulatory Notice */}
      <div className="bg-gray-50 p-6 rounded-2xl border border-gray-200 flex items-start gap-4">
        <Lock className="text-gray-500 shrink-0 mt-1" size={22} />
        <div className="text-xs text-gray-600 leading-relaxed text-justify space-y-1.5">
          <h4 className="font-bold text-gray-800 text-sm">چهارچوب حقوقی و نظارتی جذب سرمایه در هوشیار انرژی</h4>
          <p>
            این پلتفرم صرفاً یک زیرساخت فناوری برای کشف و معرفی فرصت‌های صنعتی میان صاحبان پروژه، سرمایه‌گذاران نهادی و شرکت‌های EPC است.
          </p>
          <p className="font-medium text-gray-700">
            ⛔ مواردی که در این سامانه پشتیبانی نمی‌شود و اکیداً ممنوع است:
            تأمین مالی خرد و جمعی (Crowdfunding)، توکنایزیشن، تملک خرد، سپرده‌گذاری، حساب امانی (Escrow)، عرضه عمومی اوراق بهادار و تضمین سود قطعی. کلیه توافقات مستلزم انعقاد قراردادهای رسمی حقوقی دوجانبه (B2B) میان طرفین است.
          </p>
        </div>
      </div>

      {/* Setup / Edit Modal */}
      {showSetupModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-xl relative animate-in fade-in zoom-in-95">
            <h3 className="text-lg font-bold text-gray-900 mb-1">تنظیم شرایط معرفی پروژه به سرمایه‌گذاران</h3>
            <p className="text-xs text-gray-500 mb-4">اطلاعات وارد شده برای نمایش به سرمایه‌گذاران تایید شده استفاده خواهد شد.</p>

            <div className="space-y-4 text-right">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  درصد سرمایه مورد نیاز از شریک: {partnerEquityGapPercent}٪ (سهم آورده شما: {100 - partnerEquityGapPercent}٪)
                </label>
                <input 
                  type="range" 
                  min="20" 
                  max="90" 
                  step="5"
                  value={partnerEquityGapPercent} 
                  onChange={e => setPartnerEquityGapPercent(Number(e.target.value))}
                  className="w-full accent-blue-600"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">حداقل آورده نقدی شریک (میلیون تومان)</label>
                <input 
                  type="number" 
                  value={minCapitalMillionToman} 
                  onChange={e => setMinCapitalMillionToman(Number(e.target.value))}
                  min="50"
                  className="w-full border border-gray-300 rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">نوع شریک ترجیحی</label>
                <input 
                  type="text" 
                  value={partnerType} 
                  onChange={e => setPartnerType(e.target.value)}
                  className="w-full border border-gray-300 rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
              </div>

              <div className="pt-4 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowSetupModal(false)}
                  className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-xl text-sm font-medium"
                >
                  انصراف
                </button>
                <button
                  type="button"
                  onClick={handlePublishOpportunity}
                  disabled={saving}
                  className="px-6 py-2.5 bg-blue-600 text-white rounded-xl text-sm font-bold hover:bg-blue-700 disabled:opacity-50 flex items-center gap-2"
                >
                  {saving ? <Loader2 className="animate-spin" size={16} /> : null}
                  ثبت و انتشار در بازار
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
