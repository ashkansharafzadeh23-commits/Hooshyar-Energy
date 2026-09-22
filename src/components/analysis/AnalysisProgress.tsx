import React from 'react';
import { CheckCircle2, Loader2, AlertCircle } from 'lucide-react';
import { motion } from 'framer-motion';

export type AnalysisStage = 
  | 'VALIDATING_INPUTS' 
  | 'FETCHING_SOLAR_RESOURCE' 
  | 'CALCULATING_CAPACITY' 
  | 'ESTIMATING_YIELD' 
  | 'PREPARING_RESULT' 
  | 'COMPLETED'
  | 'DEGRADED_COMPLETED';

interface AnalysisProgressProps {
  currentStage: AnalysisStage;
  city?: string;
  isDegraded?: boolean;
  degradedMessage?: string;
}

interface StepItem {
  id: AnalysisStage;
  label: string;
  sublabel: string;
}

const STAGES: StepItem[] = [
  {
    id: 'VALIDATING_INPUTS',
    label: 'بررسی اطلاعات پروژه',
    sublabel: 'اعتبارسنجی متراژ، شهر و الگوی مصرف اعلامی'
  },
  {
    id: 'FETCHING_SOLAR_RESOURCE',
    label: 'دریافت داده تابش خورشیدی',
    sublabel: 'استعلام شاخص تابش از ناسا (NASA POWER) یا اطلس مرجع'
  },
  {
    id: 'CALCULATING_CAPACITY',
    label: 'محاسبه ظرفیت پیشنهادی',
    sublabel: 'محاسبه توان کیلووات و تعداد ماژول‌های فتوولتائیک'
  },
  {
    id: 'ESTIMATING_YIELD',
    label: 'برآورد تولید انرژی',
    sublabel: 'مدل‌سازی تلفات حرارتی، سیم‌کشی و اینورتر'
  },
  {
    id: 'PREPARING_RESULT',
    label: 'آماده‌سازی نتیجه',
    sublabel: 'تنظیم گزارش خلاصه اجرایی و برآورد فنی-اقتصادی'
  }
];

export const AnalysisProgress: React.FC<AnalysisProgressProps> = ({
  currentStage,
  city,
  isDegraded = false,
  degradedMessage
}) => {
  const getStageIndex = (stage: AnalysisStage): number => {
    switch (stage) {
      case 'VALIDATING_INPUTS': return 0;
      case 'FETCHING_SOLAR_RESOURCE': return 1;
      case 'CALCULATING_CAPACITY': return 2;
      case 'ESTIMATING_YIELD': return 3;
      case 'PREPARING_RESULT': return 4;
      case 'COMPLETED':
      case 'DEGRADED_COMPLETED': return 5;
      default: return 0;
    }
  };

  const currentIndex = getStageIndex(currentStage);

  return (
    <div className="max-w-md mx-auto py-10 px-4 text-right" dir="rtl">
      {/* Title */}
      <div className="text-center mb-8">
        <h3 className="text-xl font-black text-zinc-900 dark:text-zinc-50 mb-2">
          در حال پردازش مهندسی سامانه خورشیدی
        </h3>
        {city && (
          <p className="text-xs text-zinc-500 dark:text-zinc-400">
            موقعیت پروژه: {city}
          </p>
        )}
      </div>

      {/* Progress Steps */}
      <div className="p-5 rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-sm space-y-4">
        {STAGES.map((step, idx) => {
          const isDone = idx < currentIndex;
          const isCurrent = idx === currentIndex && currentStage !== 'COMPLETED' && currentStage !== 'DEGRADED_COMPLETED';
          const isPending = idx > currentIndex;

          return (
            <div key={step.id} className="flex items-start gap-3.5">
              <div className="mt-0.5 shrink-0">
                {isDone ? (
                  <CheckCircle2 size={18} className="text-emerald-600 dark:text-emerald-400" />
                ) : isCurrent ? (
                  <Loader2 size={18} className="text-amber-500 animate-spin" />
                ) : (
                  <div className="w-4.5 h-4.5 rounded-full border border-zinc-300 dark:border-zinc-700 bg-zinc-100 dark:bg-zinc-800" />
                )}
              </div>

              <div className="flex-1 min-w-0">
                <div className={`text-xs font-bold ${
                  isDone
                    ? 'text-zinc-900 dark:text-zinc-100'
                    : isCurrent
                    ? 'text-amber-600 dark:text-amber-400 font-extrabold'
                    : 'text-zinc-400 dark:text-zinc-600'
                }`}>
                  {step.label}
                </div>
                <div className="text-[11px] text-zinc-500 dark:text-zinc-400">
                  {step.sublabel}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Degraded mode notice if external source was unavailable */}
      {isDegraded && degradedMessage && (
        <div className="mt-4 p-3.5 rounded-xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900/40 text-xs text-amber-900 dark:text-amber-300 flex items-start gap-2 leading-relaxed">
          <AlertCircle size={16} className="text-amber-600 shrink-0 mt-0.5" />
          <span>{degradedMessage}</span>
        </div>
      )}
    </div>
  );
};
