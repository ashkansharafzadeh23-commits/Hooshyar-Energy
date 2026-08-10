import React from 'react';
import { TrendingDown, PiggyBank, Calendar } from 'lucide-react';

interface SavingsCalculatorProps {
  monthlyKwh: number;
  totalCost: number;
  targets: string[];
}

export default function SavingsCalculator({ monthlyKwh, totalCost, targets }: SavingsCalculatorProps) {
  // If not solar, savings calculation is different or not applicable (e.g., generator is for backup, not savings)
  if (!targets.includes('solar')) {
    return null;
  }

  // Rough estimate for electricity price per kWh in IRR (stepped tariff average)
  // Let's assume an average of 1,500 IRR per kWh for a decent consumer, or we can use a range
  const estimatedPricePerKwh = 1500; 
  
  const monthlySavingsIRR = monthlyKwh * estimatedPricePerKwh;
  const yearlySavingsIRR = monthlySavingsIRR * 12;
  
  // Calculate ROI in years
  const roiYears = totalCost > 0 ? (totalCost / yearlySavingsIRR) : 0;

  return (
    <div className="mt-6 pt-4 border-t border-[#E4E7EC]">
      <h3 className="text-sm font-bold text-[#1A1D23] mb-4 flex items-center gap-2">
        <PiggyBank size={18} className="text-[#1F9254]" />
        برآورد بازگشت سرمایه و صرفه‌جویی
      </h3>
      
      <div className="grid grid-cols-1 gap-3">
        <div className="bg-[#1F9254]/5 rounded-xl p-3 flex justify-between items-center border border-[#1F9254]/20">
          <div className="flex items-center gap-2 text-[#5A6072] text-xs">
            <TrendingDown size={14} className="text-[#1F9254]" />
            صرفه‌جویی سالانه
          </div>
          <div className="text-base font-black text-[#1F9254]">
            {(yearlySavingsIRR / 10).toLocaleString()} <span className="text-[10px] font-normal">تومان</span>
          </div>
        </div>

        <div className="bg-blue-50 rounded-xl p-3 flex justify-between items-center border border-blue-100">
          <div className="flex items-center gap-2 text-[#5A6072] text-xs">
            <Calendar size={14} className="text-blue-600" />
            زمان بازگشت سرمایه
          </div>
          <div className="text-base font-black text-blue-700">
            {roiYears > 0 ? `${roiYears.toFixed(1)} سال` : 'نامشخص'}
          </div>
        </div>
      </div>
      <p className="text-[10px] text-[#5A6072] mt-4 italic text-center">
        * این محاسبات تقریبی بوده و بر اساس میانگین تعرفه برق ({estimatedPricePerKwh} ریال بر کیلووات‌ساعت) در نظر گرفته شده است.
      </p>
    </div>
  );
}
