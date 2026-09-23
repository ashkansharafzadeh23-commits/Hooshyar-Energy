import React, { useState } from 'react';
import { 
  Building2, 
  Coins, 
  FileCheck2, 
  CheckCircle2, 
  AlertCircle, 
  ArrowRight, 
  ChevronLeft, 
  ChevronRight,
  ShieldCheck,
  X
} from 'lucide-react';
import { EnergyProject } from '../../types/project';
import { FinancingRequest } from '../../types/financing';
import { DataTruthBadge } from '../common/DataTruthBadge';

interface FinancingApplicationFlowProps {
  project: EnergyProject;
  isOpen: boolean;
  onClose: () => void;
  onCreated: (request: FinancingRequest) => void;
}

export const FinancingApplicationFlow: React.FC<FinancingApplicationFlowProps> = ({
  project,
  isOpen,
  onClose,
  onCreated
}) => {
  const [currentStep, setCurrentStep] = useState<number>(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Form State initialized truthfully from real project data if available
  const [formData, setFormData] = useState({
    totalProjectCostTomans: (project.estimatedBudget?.amount ? project.estimatedBudget.amount / 10 : (project.estimatedBudgetIRR ? project.estimatedBudgetIRR / 10 : '')) as any,
    ownerEquityTomans: '' as any,
    requestedAmountTomans: '' as any,
    financingType: 'PROJECT_LOAN',
    requestedTenorMonths: 48,
    preferredGracePeriodMonths: 6,
    repaymentPreference: 'EQUAL_INSTALLMENT',
    collateralSummary: 'توثیق سند ساختگاه و قرارداد فروش برق ساتبا',
    summary: `درخواست تسهیلات جهت احداث نیروگاه خورشیدی ${project.targetCapacityKw || ''} کیلوواتی واقع در ${project.location?.province || ''}`
  });

  if (!isOpen) return null;

  const steps = [
    { num: 1, title: 'مشخصات طرح' },
    { num: 2, title: 'ساختار تسهیلات' },
    { num: 3, title: 'وثایق و بازپرداخت' },
    { num: 4, title: 'مرور و ارسال' }
  ];

  const handleNext = () => {
    setErrorMessage(null);
    if (currentStep === 1) {
      if (!formData.totalProjectCostTomans || Number(formData.totalProjectCostTomans) <= 0) {
        setErrorMessage('لطفاً برآورد کل هزینه طرح (CAPEX) را به تومان وارد نمایید.');
        return;
      }
    }
    if (currentStep === 2) {
      if (!formData.requestedAmountTomans || Number(formData.requestedAmountTomans) <= 0) {
        setErrorMessage('لطفاً مبلغ تسهیلات درخواستی را مشخص نمایید.');
        return;
      }
      if (formData.ownerEquityTomans === '' || Number(formData.ownerEquityTomans) < 0) {
        setErrorMessage('لطفاً آورده نقدی یا غیرنقدی کارفرما را تعیین نمایید.');
        return;
      }
      const total = Number(formData.totalProjectCostTomans);
      const req = Number(formData.requestedAmountTomans);
      const eq = Number(formData.ownerEquityTomans);
      if (req + eq > total * 1.5) {
        setErrorMessage('مجموع آورده کارفرما و مبلغ تسهیلات بیش از هزینه کل برآورد شده است.');
        return;
      }
    }
    setCurrentStep((prev) => Math.min(prev + 1, 4));
  };

  const handlePrev = () => {
    setErrorMessage(null);
    setCurrentStep((prev) => Math.max(prev - 1, 1));
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    setErrorMessage(null);
    try {
      const token = localStorage.getItem('token');
      // Convert Tomans to stored currency (Rials) if backend expects Rials:
      // In Hooshyar Energy backend, amounts are stored in Rials (IRR) or Tomans. Let's check api/financing.ts:
      // req.body.requestedAmount, totalProjectCost, ownerEquity
      const payload = {
        projectId: project.id,
        financingType: formData.financingType,
        totalProjectCost: Number(formData.totalProjectCostTomans) * 10, // store in Rials
        ownerEquity: Number(formData.ownerEquityTomans) * 10,
        requestedAmount: Number(formData.requestedAmountTomans) * 10,
        currency: 'IRR',
        requestedTenorMonths: Number(formData.requestedTenorMonths),
        preferredGracePeriodMonths: Number(formData.preferredGracePeriodMonths),
        repaymentPreference: formData.repaymentPreference,
        collateralAvailable: true,
        collateralSummary: formData.collateralSummary,
        summary: formData.summary
      };

      const res = await fetch(`/api/projects/${project.id}/financing-requests`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {})
        },
        body: JSON.stringify(payload)
      });

      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.error || 'خطا در ثبت درخواست');
      }

      const created = await res.json();
      onCreated(created);
      onClose();
    } catch (err: any) {
      console.error(err);
      setErrorMessage(err.message || 'خطا در ایجاد پرونده تأمین مالی');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs font-Vazirmatn">
      <div className="bg-white dark:bg-zinc-900 rounded-3xl max-w-xl w-full p-6 sm:p-8 border border-slate-200 dark:border-zinc-800 shadow-2xl space-y-6 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-start justify-between pb-4 border-b border-slate-200 dark:border-zinc-800">
          <div>
            <h3 className="text-base sm:text-lg font-bold text-slate-900 dark:text-zinc-100 mb-1">
              تنظیم و ثبت پرونده درخواست تسهیلات
            </h3>
            <p className="text-xs text-slate-500 dark:text-zinc-400">
              پروژه: {project.title} ({project.projectCode || project.id})
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-600 rounded-xl cursor-pointer min-h-[44px]"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Step Indicator */}
        <div className="flex items-center justify-between px-2">
          {steps.map((st) => (
            <div key={st.num} className="flex flex-col items-center">
              <div
                className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
                  currentStep === st.num
                    ? 'bg-blue-600 text-white shadow-xs'
                    : currentStep > st.num
                    ? 'bg-emerald-600 text-white'
                    : 'bg-slate-100 dark:bg-zinc-800 text-slate-400'
                }`}
              >
                {currentStep > st.num ? <CheckCircle2 className="w-4 h-4" /> : st.num}
              </div>
              <span className="text-[11px] font-bold text-slate-600 dark:text-zinc-400 mt-1">
                {st.title}
              </span>
            </div>
          ))}
        </div>

        {/* Error Alert */}
        {errorMessage && (
          <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 text-xs text-rose-700 dark:text-rose-300 flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{errorMessage}</span>
          </div>
        )}

        {/* Step 1: Project Identity & Total Cost */}
        {currentStep === 1 && (
          <div className="space-y-4">
            <div>
              <label className="text-xs font-bold text-slate-700 dark:text-zinc-300 block mb-1">
                برآورد کل هزینه احداث طرح (CAPEX) - تومان
              </label>
              <input
                type="number"
                value={formData.totalProjectCostTomans}
                onChange={(e) => setFormData({ ...formData, totalProjectCostTomans: e.target.value })}
                placeholder="مثال: ۲۵۰۰۰۰۰۰۰۰ (۲.۵ میلیارد تومان)"
                className="w-full px-3 py-2.5 rounded-xl border border-slate-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-xs sm:text-sm font-mono focus:ring-2 focus:ring-blue-500 focus:outline-hidden min-h-[44px]"
              />
              <span className="text-[11px] text-slate-400 block mt-1">
                بر مبنای استعلام اقلام تجهیزات و خدمات مهندسی
              </span>
            </div>

            <div>
              <label className="text-xs font-bold text-slate-700 dark:text-zinc-300 block mb-1">
                نوع تسهیلات درخواستی
              </label>
              <select
                value={formData.financingType}
                onChange={(e) => setFormData({ ...formData, financingType: e.target.value })}
                className="w-full px-3 py-2.5 rounded-xl border border-slate-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-xs sm:text-sm focus:ring-2 focus:ring-blue-500 focus:outline-hidden min-h-[44px] cursor-pointer"
              >
                <option value="PROJECT_LOAN">تسهیلات احداث نیروگاه (Project Loan)</option>
                <option value="EQUIPMENT_FINANCING">تسهیلات خرید تجهیزات اصلی (اینورتر/پنل)</option>
                <option value="WORKING_CAPITAL">سرمایه در گردش</option>
              </select>
            </div>
          </div>
        )}

        {/* Step 2: Equity & Debt Amounts */}
        {currentStep === 2 && (
          <div className="space-y-4">
            <div>
              <label className="text-xs font-bold text-slate-700 dark:text-zinc-300 block mb-1">
                آورده نقدی/غیرنقدی کارفرما (Equity) - تومان
              </label>
              <input
                type="number"
                value={formData.ownerEquityTomans}
                onChange={(e) => setFormData({ ...formData, ownerEquityTomans: e.target.value })}
                placeholder="مثال: ۷۵۰۰۰۰۰۰۰ (۷۵۰ میلیون تومان)"
                className="w-full px-3 py-2.5 rounded-xl border border-slate-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-xs sm:text-sm font-mono focus:ring-2 focus:ring-blue-500 focus:outline-hidden min-h-[44px]"
              />
              <span className="text-[11px] text-slate-400 block mt-1">
                حداقل آورده معمولاً بین ۲۰٪ تا ۳۰٪ از کل طرح است.
              </span>
            </div>

            <div>
              <label className="text-xs font-bold text-slate-700 dark:text-zinc-300 block mb-1">
                مبلغ تسهیلات مورد نیاز (Debt) - تومان
              </label>
              <input
                type="number"
                value={formData.requestedAmountTomans}
                onChange={(e) => setFormData({ ...formData, requestedAmountTomans: e.target.value })}
                placeholder="مثال: ۱۷۵۰۰۰۰۰۰۰ (۱.۷۵ میلیارد تومان)"
                className="w-full px-3 py-2.5 rounded-xl border border-slate-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-xs sm:text-sm font-mono focus:ring-2 focus:ring-blue-500 focus:outline-hidden min-h-[44px]"
              />
            </div>
          </div>
        )}

        {/* Step 3: Tenor & Collateral */}
        {currentStep === 3 && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-bold text-slate-700 dark:text-zinc-300 block mb-1">
                  مدت بازپرداخت (ماه)
                </label>
                <input
                  type="number"
                  value={formData.requestedTenorMonths}
                  onChange={(e) => setFormData({ ...formData, requestedTenorMonths: Number(e.target.value) })}
                  className="w-full px-3 py-2.5 rounded-xl border border-slate-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-xs sm:text-sm font-mono min-h-[44px]"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 dark:text-zinc-300 block mb-1">
                  دوره تنفس حین احداث (ماه)
                </label>
                <input
                  type="number"
                  value={formData.preferredGracePeriodMonths}
                  onChange={(e) => setFormData({ ...formData, preferredGracePeriodMonths: Number(e.target.value) })}
                  className="w-full px-3 py-2.5 rounded-xl border border-slate-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-xs sm:text-sm font-mono min-h-[44px]"
                />
              </div>
            </div>

            <div>
              <label className="text-xs font-bold text-slate-700 dark:text-zinc-300 block mb-1">
                وثایق و تضامین پیشنهادی کارفرما
              </label>
              <textarea
                rows={2}
                value={formData.collateralSummary}
                onChange={(e) => setFormData({ ...formData, collateralSummary: e.target.value })}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-xs leading-relaxed"
              />
            </div>
          </div>
        )}

        {/* Step 4: Review Screen */}
        {currentStep === 4 && (
          <div className="space-y-3 p-4 rounded-2xl bg-slate-50 dark:bg-zinc-800/40 border border-slate-200/80 dark:border-zinc-800 text-xs">
            <div className="flex items-center justify-between pb-2 border-b border-slate-200/60 dark:border-zinc-700">
              <span className="font-bold text-slate-800 dark:text-zinc-200">هزینه کل طرح (CAPEX):</span>
              <span className="font-bold font-mono text-slate-900 dark:text-zinc-100">
                {Number(formData.totalProjectCostTomans).toLocaleString('fa-IR')} تومان
              </span>
            </div>

            <div className="flex items-center justify-between pb-2 border-b border-slate-200/60 dark:border-zinc-700">
              <span className="font-bold text-slate-800 dark:text-zinc-200">آورده کارفرما (Equity):</span>
              <span className="font-bold font-mono text-slate-900 dark:text-zinc-100">
                {Number(formData.ownerEquityTomans).toLocaleString('fa-IR')} تومان
              </span>
            </div>

            <div className="flex items-center justify-between pb-2 border-b border-slate-200/60 dark:border-zinc-700">
              <span className="font-bold text-blue-700 dark:text-blue-300">مبلغ تسهیلات درخواستی:</span>
              <span className="font-black font-mono text-blue-900 dark:text-blue-100 text-sm">
                {Number(formData.requestedAmountTomans).toLocaleString('fa-IR')} تومان
              </span>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-slate-500">مدت بازپرداخت و تنفس:</span>
              <span className="font-mono text-slate-800 dark:text-zinc-200">
                {formData.requestedTenorMonths} ماه ({formData.preferredGracePeriodMonths} ماه تنفس)
              </span>
            </div>
          </div>
        )}

        {/* Navigation Buttons */}
        <div className="pt-4 border-t border-slate-200 dark:border-zinc-800 flex items-center justify-between gap-3">
          {currentStep > 1 ? (
            <button
              type="button"
              onClick={handlePrev}
              disabled={isSubmitting}
              className="px-4 py-2 rounded-xl border border-slate-200 dark:border-zinc-700 text-slate-700 dark:text-zinc-300 text-xs font-bold hover:bg-slate-50 cursor-pointer min-h-[44px]"
            >
              مرحله قبل
            </button>
          ) : (
            <div />
          )}

          {currentStep < 4 ? (
            <button
              type="button"
              onClick={handleNext}
              className="inline-flex items-center gap-1.5 px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs sm:text-sm font-bold shadow-xs cursor-pointer min-h-[44px]"
            >
              <span>مرحله بعد</span>
              <ChevronLeft className="w-4 h-4" />
            </button>
          ) : (
            <button
              type="button"
              onClick={handleSubmit}
              disabled={isSubmitting}
              className="inline-flex items-center gap-1.5 px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs sm:text-sm font-bold shadow-xs cursor-pointer min-h-[44px]"
            >
              {isSubmitting ? (
                <span>در حال ارسال پرونده...</span>
              ) : (
                <>
                  <CheckCircle2 className="w-4 h-4" />
                  <span>ثبت قطعی پرونده تسهیلات</span>
                </>
              )}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
