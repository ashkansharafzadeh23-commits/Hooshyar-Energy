import React from 'react';
import { Clock, HelpCircle, CheckCircle2, AlertTriangle, WifiOff, TestTube2 } from 'lucide-react';
import { toPersianDigits } from '../../utils/formatters';

export type FreshnessClassification = 
  | 'LIVE' 
  | 'DELAYED' 
  | 'STALE' 
  | 'SYNTHETIC' 
  | 'NO_DATA';

export interface DataFreshnessIndicatorProps {
  lastReadingTimestamp?: string | null;
  statusClassification?: 'CONNECTED' | 'STALE' | 'DEGRADED' | 'CONFIGURED_NOT_VERIFIED' | 'NO_SOURCES_CONFIGURED' | 'SYNTHETIC_TEST_DATA' | string | null;
  staleThresholdHours?: number | null;
  isSynthetic?: boolean;
  className?: string;
}

export function formatPersianDateTime(isoString?: string | null): string {
  if (!isoString) return 'زمان دریافت داده ثبت نشده است';
  try {
    const d = new Date(isoString);
    if (isNaN(d.getTime())) return isoString;

    // Use Intl for Persian Jalali calendar
    const formatter = new Intl.DateTimeFormat('fa-IR', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      hour12: false,
    });
    return formatter.format(d);
  } catch {
    return toPersianDigits(isoString);
  }
}

export const DataFreshnessIndicator: React.FC<DataFreshnessIndicatorProps> = ({
  lastReadingTimestamp,
  statusClassification,
  staleThresholdHours,
  isSynthetic = false,
  className = '',
}) => {
  // Determine classification strictly according to data
  let classification: FreshnessClassification = 'NO_DATA';
  let badgeLabel = 'داده تله‌متری ثبت نشده است';
  let badgeColor = 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300 border-slate-200 dark:border-slate-700';
  let Icon = HelpCircle;

  if (isSynthetic || statusClassification === 'SYNTHETIC_TEST_DATA') {
    classification = 'SYNTHETIC';
    badgeLabel = 'داده تستی شبیه‌سازی‌شده';
    badgeColor = 'bg-purple-50 text-purple-700 dark:bg-purple-950/40 dark:text-purple-300 border-purple-200 dark:border-purple-800';
    Icon = TestTube2;
  } else if (!lastReadingTimestamp) {
    classification = 'NO_DATA';
    badgeLabel = 'داده تله‌متری ثبت نشده است';
    badgeColor = 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300 border-slate-200 dark:border-slate-700';
    Icon = HelpCircle;
  } else if (statusClassification === 'STALE') {
    classification = 'STALE';
    badgeLabel = 'داده متوقف / فاقد تله‌متری';
    badgeColor = 'bg-rose-50 text-rose-700 dark:bg-rose-950/40 dark:text-rose-300 border-rose-200 dark:border-rose-800';
    Icon = WifiOff;
  } else if (statusClassification === 'DEGRADED') {
    classification = 'DELAYED';
    badgeLabel = 'تأخیر در دریافت داده';
    badgeColor = 'bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-300 border-amber-200 dark:border-amber-800';
    Icon = AlertTriangle;
  } else if (statusClassification === 'CONNECTED') {
    classification = 'LIVE';
    badgeLabel = 'داده زنده و همگام';
    badgeColor = 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800';
    Icon = CheckCircle2;
  } else {
    // Check timestamp difference if available
    try {
      const diffMs = Date.now() - new Date(lastReadingTimestamp).getTime();
      const diffHours = diffMs / (1000 * 60 * 60);
      const threshold = staleThresholdHours || 24;

      if (diffHours <= 1) {
        classification = 'LIVE';
        badgeLabel = 'داده زنده و همگام';
        badgeColor = 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800';
        Icon = CheckCircle2;
      } else if (diffHours <= threshold) {
        classification = 'DELAYED';
        badgeLabel = 'تأخیر در دریافت داده';
        badgeColor = 'bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-300 border-amber-200 dark:border-amber-800';
        Icon = AlertTriangle;
      } else {
        classification = 'STALE';
        badgeLabel = 'داده متوقف / فاقد تله‌متری';
        badgeColor = 'bg-rose-50 text-rose-700 dark:bg-rose-950/40 dark:text-rose-300 border-rose-200 dark:border-rose-800';
        Icon = WifiOff;
      }
    } catch {
      classification = 'NO_DATA';
      badgeLabel = 'تازگی داده قابل ارزیابی نیست';
    }
  }

  if (!lastReadingTimestamp) {
    return (
      <div className={`inline-flex items-center gap-2 text-xs ${className}`}>
        <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md text-[11px] font-medium border ${badgeColor}`}>
          <Icon className="w-3 h-3" />
          <span>{badgeLabel}</span>
        </span>
        <span className="text-slate-400 dark:text-slate-500">
          (زمان دریافت داده ثبت نشده است)
        </span>
      </div>
    );
  }

  const formattedDate = formatPersianDateTime(lastReadingTimestamp);

  return (
    <div className={`inline-flex flex-wrap items-center gap-2 text-xs text-slate-600 dark:text-slate-300 ${className}`}>
      <div className="flex items-center gap-1.5">
        <Clock className="w-3.5 h-3.5 text-slate-400 shrink-0" />
        <span>
          آخرین داده دریافت شده: <strong className="font-semibold text-slate-800 dark:text-slate-100">{formattedDate}</strong>
        </span>
      </div>

      <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md text-[11px] font-medium border ${badgeColor}`}>
        <Icon className="w-3 h-3" />
        <span>{badgeLabel}</span>
      </span>

      {classification === 'STALE' && staleThresholdHours && (
        <span className="text-[10px] text-slate-400">
          (بیش از {toPersianDigits(staleThresholdHours)} ساعت بدون داده)
        </span>
      )}
    </div>
  );
};
