import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine } from 'recharts';
import { Sun } from 'lucide-react';

interface Props {
  monthlySunHours?: Record<string, number>;
  systemKwp?: number;
}

const persianMonths = [
  'فروردین', 'اردیبهشت', 'خرداد',
  'تیر', 'مرداد', 'شهریور',
  'مهر', 'آبان', 'آذر',
  'دی', 'بهمن', 'اسفند'
];

const daysInMonth = [
  31, 31, 31, 31, 31, 31,
  30, 30, 30, 30, 30, 29
];

const mapGregorianToJalali: Record<string, { index: number; name: string }> = {
  JAN: { index: 9, name: 'دی' },
  FEB: { index: 10, name: 'بهمن' },
  MAR: { index: 11, name: 'اسفند' },
  APR: { index: 0, name: 'فروردین' },
  MAY: { index: 1, name: 'اردیبهشت' },
  JUN: { index: 2, name: 'خرداد' },
  JUL: { index: 3, name: 'تیر' },
  AUG: { index: 4, name: 'مرداد' },
  SEP: { index: 5, name: 'شهریور' },
  OCT: { index: 6, name: 'مهر' },
  NOV: { index: 7, name: 'آبان' },
  DEC: { index: 8, name: 'آذر' }
};

export default function MonthlyGenerationChart({ monthlySunHours, systemKwp }: Props) {
  if (!monthlySunHours || !systemKwp) return null;

  const PERFORMANCE_RATIO = 0.775;
  const data = new Array(12).fill({ name: '', generation: 0 });
  
  Object.entries(mapGregorianToJalali).forEach(([gregorian, jalali]) => {
    const sunHours = monthlySunHours[gregorian] || 0;
    const days = daysInMonth[jalali.index];
    const monthlyGen = systemKwp * sunHours * PERFORMANCE_RATIO * days;
    data[jalali.index] = {
      name: jalali.name,
      generation: Math.round(monthlyGen)
    };
  });

  const averageGen = Math.round(data.reduce((acc, curr) => acc + curr.generation, 0) / 12);

  return (
    <div className="bg-white dark:bg-[#1a1b1e] rounded-xl border border-zinc-200/50 dark:border-zinc-800 p-4 lg:p-6 mt-6 shadow-sm w-full">
      <h3 className="font-semibold text-zinc-900 dark:text-zinc-100 mb-6 flex items-center gap-2 text-sm md:text-base">
        <Sun size={18} className="text-[#F59E0B]" />
        پیش‌بینی تولید برق ماهیانه سیستم خورشیدی (کیلووات‌ساعت)
      </h3>
      
      <div className="h-[300px] w-full" dir="ltr">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={data}
            margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
            barSize={20}
          >
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" opacity={0.5} />
            <XAxis 
              dataKey="name" 
              axisLine={false}
              tickLine={false}
              tick={{ fill: '#6b7280', fontSize: 12, fontFamily: 'Vazirmatn, sans-serif' }}
              dy={10}
            />
            <YAxis 
              axisLine={false}
              tickLine={false}
              tick={{ fill: '#6b7280', fontSize: 12 }}
              dx={-10}
            />
            <Tooltip
              cursor={{ fill: '#f3f4f6', opacity: 0.4 }}
              contentStyle={{ 
                borderRadius: '8px', 
                border: 'none',
                boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)',
                fontFamily: 'Vazirmatn, sans-serif',
                textAlign: 'right'
              }}
              formatter={(value: number) => [`${value} kWh`, 'تولید برق']}
              labelFormatter={(label) => `ماه ${label}`}
            />
            <ReferenceLine 
              y={averageGen} 
              stroke="#f59e0b" 
              strokeDasharray="3 3" 
              label={{ 
                position: 'top', 
                value: 'میانگین تولید', 
                fill: '#f59e0b', 
                fontSize: 10,
                fontFamily: 'Vazirmatn, sans-serif'
              }} 
            />
            <Bar 
              dataKey="generation" 
              fill="#3b82f6" 
              radius={[4, 4, 0, 0]} 
            />
          </BarChart>
        </ResponsiveContainer>
      </div>
      
      <div className="mt-4 text-center text-xs text-zinc-500 dark:text-zinc-400">
        این نمودار بر اساس داده‌های تابش ماهیانه‌ی NASA POWER برای منطقه شما محاسبه شده است.
      </div>
    </div>
  );
}
