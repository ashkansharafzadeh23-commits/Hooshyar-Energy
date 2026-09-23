import React from 'react';
import { ProjectContract, ContractParty } from '../../../types/execution';
import { FileText, Building2, User, Calendar, DollarSign, ShieldCheck } from 'lucide-react';

interface AssetContractSummaryProps {
  contract: ProjectContract | null;
  parties?: ContractParty[];
  loading?: boolean;
  className?: string;
}

export const AssetContractSummary: React.FC<AssetContractSummaryProps> = ({
  contract,
  parties = [],
  loading = false,
  className = ''
}) => {
  const formatDate = (dateStr?: string) => {
    if (!dateStr) return 'ثبت نشده';
    try {
      return new Date(dateStr).toLocaleDateString('fa-IR');
    } catch {
      return dateStr;
    }
  };

  const formatCurrency = (amount?: number, curr = 'IRR') => {
    if (typeof amount !== 'number') return 'ثبت نشده';
    return `${amount.toLocaleString('fa-IR')} ${curr === 'IRR' ? 'ریال' : curr}`;
  };

  if (!contract) {
    return (
      <div className={`p-8 text-center rounded-2xl bg-slate-50/60 dark:bg-zinc-800/30 border border-dashed border-slate-200 dark:border-zinc-800 ${className}`}>
        <FileText className="w-8 h-8 text-slate-300 dark:text-zinc-600 mx-auto mb-2" />
        <p className="text-xs font-semibold text-slate-700 dark:text-zinc-300">
          اطلاعات قرارداد مبنا برای این دارایی ثبت نشده است.
        </p>
      </div>
    );
  }

  return (
    <div className={`space-y-4 ${className}`}>
      <div>
        <h3 className="text-sm font-bold text-slate-900 dark:text-zinc-100 flex items-center gap-2">
          <FileText className="w-4 h-4 text-blue-600 dark:text-blue-400" />
          <span>خلاصه مشخصات قرارداد احداث و پیمانکاری (EPC Contract)</span>
        </h3>
        <p className="text-xs text-slate-500 dark:text-zinc-400 mt-0.5">
          مستندات حقوقی مبنای ساخت، طرفین قرارداد و ارزش مصوب
        </p>
      </div>

      <div className="p-4 sm:p-5 rounded-2xl border border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3 pb-3 border-b border-slate-100 dark:border-zinc-800">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-xs font-mono font-bold px-2 py-0.5 rounded-md bg-slate-100 dark:bg-zinc-800 text-slate-700 dark:text-zinc-300">
                {contract.contractCode || 'شماره قرارداد ثبت نشده'}
              </span>
              <span className="text-xs font-bold text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 px-2 py-0.5 rounded-md">
                {contract.status === 'COMPLETED' ? 'تکمیل و تسویه‌شده' : 'قرارداد معتبر و نافذ'}
              </span>
            </div>
            <h4 className="text-sm font-bold text-slate-900 dark:text-zinc-100">
              {contract.title || 'قرارداد مهندسی، تأمین و احداث نیروگاه (EPC)'}
            </h4>
          </div>

          <div className="text-left">
            <span className="text-[10px] text-slate-400 dark:text-zinc-500 block">مبلغ نهایی پیمان:</span>
            <span className="text-sm font-bold font-mono text-slate-900 dark:text-zinc-100">
              {formatCurrency(contract.revisedContractValue || contract.contractValue, contract.currency)}
            </span>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
          <div className="p-3 rounded-xl bg-slate-50 dark:bg-zinc-800/40 border border-slate-100 dark:border-zinc-800">
            <span className="text-slate-500 dark:text-zinc-400 block mb-1">تاریخ نفوذ و آغاز:</span>
            <span className="font-bold text-slate-800 dark:text-zinc-200">
              {formatDate(contract.startDate || contract.effectiveDate)}
            </span>
          </div>

          <div className="p-3 rounded-xl bg-slate-50 dark:bg-zinc-800/40 border border-slate-100 dark:border-zinc-800">
            <span className="text-slate-500 dark:text-zinc-400 block mb-1">تاریخ امضای قطعی:</span>
            <span className="font-bold text-slate-800 dark:text-zinc-200">
              {formatDate(contract.signedAt)}
            </span>
          </div>

          <div className="p-3 rounded-xl bg-slate-50 dark:bg-zinc-800/40 border border-slate-100 dark:border-zinc-800">
            <span className="text-slate-500 dark:text-zinc-400 block mb-1">دوره تضمین حسن انجام کار:</span>
            <span className="font-bold text-slate-800 dark:text-zinc-200">
              {contract.warrantyPeriodMonths ? `${contract.warrantyPeriodMonths} ماه` : 'ثبت نشده'}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
