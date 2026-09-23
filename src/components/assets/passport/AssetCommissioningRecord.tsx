import React from 'react';
import { CommissioningRecord, CommissioningTest } from '../../../types/asset';
import { ShieldCheck, CheckCircle2, Calendar, FileText, User } from 'lucide-react';
import { CommissioningTestResult } from '../../execution/CommissioningTestResult';

interface AssetCommissioningRecordProps {
  commissioningRecord: CommissioningRecord | null;
  tests: CommissioningTest[];
  loading?: boolean;
  className?: string;
}

export const AssetCommissioningRecord: React.FC<AssetCommissioningRecordProps> = ({
  commissioningRecord,
  tests,
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

  if (!commissioningRecord) {
    return (
      <div className={`p-8 text-center rounded-2xl bg-slate-50/60 dark:bg-zinc-800/30 border border-dashed border-slate-200 dark:border-zinc-800 ${className}`}>
        <ShieldCheck className="w-8 h-8 text-slate-300 dark:text-zinc-600 mx-auto mb-2" />
        <p className="text-xs font-semibold text-slate-700 dark:text-zinc-300">
          سابقه راه‌اندازی برای این دارایی ثبت نشده است.
        </p>
      </div>
    );
  }

  return (
    <div className={`space-y-4 ${className}`}>
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-sm font-bold text-slate-900 dark:text-zinc-100 flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-purple-600 dark:text-purple-400" />
            <span>شناسنامه و سوابق راه‌اندازی فنی (Commissioning Record)</span>
          </h3>
          <p className="text-xs text-slate-500 dark:text-zinc-400 mt-0.5">
            آزمون‌های استاندارد الکتریکی و انطباق فنی که مبنای بهره‌برداری تجاری نیروگاه بوده‌اند
          </p>
        </div>

        <span className="text-xs font-bold px-2.5 py-1 rounded-md bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
          تأیید قطعی شده ✓
        </span>
      </div>

      {/* Record Metadata summary */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs bg-slate-50/80 dark:bg-zinc-800/40 p-4 rounded-2xl border border-slate-200/80 dark:border-zinc-800">
        <div>
          <span className="text-slate-500 dark:text-zinc-400 block mb-0.5">تاریخ تأیید رسمی:</span>
          <span className="font-bold text-slate-800 dark:text-zinc-200">
            {formatDate(commissioningRecord.actualDate || commissioningRecord.updatedAt)}
          </span>
        </div>

        <div>
          <span className="text-slate-500 dark:text-zinc-400 block mb-0.5">تعداد آزمون‌های مصوب:</span>
          <span className="font-bold text-slate-800 dark:text-zinc-200 font-mono">
            {tests.filter(t => t.status === 'PASSED').length} از {tests.length} آزمون
          </span>
        </div>

        <div>
          <span className="text-slate-500 dark:text-zinc-400 block mb-0.5">تأییدکننده فنی:</span>
          <span className="font-bold text-slate-800 dark:text-zinc-200">
            {commissioningRecord.approvedByUserId ? `کاربر #${commissioningRecord.approvedByUserId}` : 'ثبت سیستمی ناظر'}
          </span>
        </div>
      </div>

      {/* Verified Tests list */}
      <div className="space-y-2">
        <h4 className="text-xs font-bold text-slate-700 dark:text-zinc-300">
          آزمون‌های استاندارد ثبت‌شده در پرونده:
        </h4>

        <div className="space-y-2.5">
          {tests.map((test) => (
            <CommissioningTestResult key={test.id} test={test} />
          ))}
        </div>
      </div>
    </div>
  );
};
