import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAppContext } from '../context/AppContext';
import { motion } from 'framer-motion';
import { Check, Info, AlertTriangle, ExternalLink, Zap, Share, Map, Lightbulb } from 'lucide-react';
import SavingsCalculator from '../components/SavingsCalculator';
import EnergyEfficiencyChart from '../components/EnergyEfficiencyChart';
import { SmartWarning } from '../components/SmartWarning';
import { AdBanner } from '../components/AdBanner';

export default function ResultPage() {
  const { state } = useAppContext();
  const [loading, setLoading] = useState(true);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchAnalysis = async () => {
      try {
        const response = await fetch('/api/analyze', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(state)
        });
        
        if (!response.ok) throw new Error('Analysis failed');
        
        const data = await response.json();
        setResult(data);
      } catch (err) {
        setError('خطا در ارتباط با سرور. لطفاً دوباره تلاش کنید.');
      } finally {
        setLoading(false);
      }
    };

    fetchAnalysis();
  }, []);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh]">
        <div className="w-16 h-16 border-4 border-gray-200 border-t-blue-600 rounded-full animate-spin mb-6"></div>
        <h2 className="text-xl font-medium animate-pulse">در حال تحلیل داده‌ها و جستجوی محصولات...</h2>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center text-red-500 pt-20">
        <AlertTriangle size={48} className="mx-auto mb-4" />
        <h2 className="text-xl font-bold">{error}</h2>
      </div>
    );
  }

  if (!result) return null;

  // Determine theme colors based on targets
  let themePrimary = 'var(--solar-primary)';
  let themeAccent = 'var(--solar-accent)';
  if (state.targets.includes('generator')) {
    themePrimary = 'var(--generator-primary)';
    themeAccent = 'var(--generator-accent)';
  } else if (state.targets.includes('powerbank')) {
    themePrimary = 'var(--powerbank-primary)';
    themeAccent = 'var(--powerbank-accent)';
  }

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="pb-10"
    >
      <div className="flex flex-col lg:grid lg:grid-cols-12 lg:grid-rows-8 gap-4 min-h-[800px]">
        {/* 1. Analysis Summary (Bento Tall) */}
        <section className="col-span-4 row-span-4 bg-white rounded-2xl border border-[#E4E7EC] p-6 shadow-sm flex flex-col">
          <div className="flex items-center gap-2 mb-6 shrink-0">
            <div className="w-2 h-8 rounded-full" style={{ backgroundColor: themePrimary }}></div>
            <h2 className="text-xl font-bold text-[#1A1D23]">تحلیل انرژی شما</h2>
          </div>
          
          <div className="flex-1 flex flex-col">
            <div className="bg-[#F7F8FA] p-4 rounded-xl border border-dashed border-[#E4E7EC] shrink-0">
              <div className="text-sm text-[#5A6072] mb-1">تخمین مصرف روزانه</div>
              <div className="flex items-baseline gap-2">
                <span className="text-4xl font-black" style={{ color: themePrimary }}>
                  {result.dailyConsumptionEstimate.dailyKwh.toFixed(1)}
                </span>
                <span className="text-lg font-medium text-[#1A1D23]">kWh</span>
              </div>
            </div>

            <div className="mt-6 flex-1 overflow-y-auto pr-1">
              <p className="text-sm leading-relaxed text-[#5A6072]">{result.summary}</p>
              
              <SavingsCalculator 
                monthlyKwh={result.dailyConsumptionEstimate.monthlyKwh}
                totalCost={result.estimatedTotalCost}
                targets={state.targets}
              />

              {state.targets.includes('solar') && (
                <div className="mt-6">
                  <Link 
                    to="/solar-planner"
                    className="w-full bg-[#1F9254] text-white py-3 rounded-xl text-sm font-bold flex items-center justify-center gap-2 hover:bg-[#167643] transition-colors shadow-[0_4px_12px_rgba(31,146,84,0.3)]"
                  >
                    <Zap size={18} />
                    شبیه‌ساز سه‌بعدی سقف و پنل خورشیدی
                  </Link>
                </div>
              )}
            </div>
          </div>
        </section>

        {/* 2. Recommended Products (Bento Large) */}
        <section className="col-span-5 row-span-8 bg-white rounded-2xl border border-[#E4E7EC] shadow-sm flex flex-col overflow-hidden">
          <div className="p-5 border-b border-[#E4E7EC] bg-[#F7F8FA]/50 flex justify-between items-center shrink-0">
            <h2 className="font-bold flex items-center gap-2 text-[#1A1D23]">
              <span style={{ color: themePrimary }}>🛒</span>
              محصولات پیشنهادی
            </h2>
            <Link 
              to="/sellers"
              className="text-xs bg-white border border-[#E4E7EC] text-[#1A1D23] px-3 py-1.5 rounded-lg flex items-center gap-2 hover:bg-[#F7F8FA] transition-colors shadow-sm font-medium"
            >
              <Map size={14} className="text-[#5A6072]" />
              لیست فروشندگان (نقشه)
            </Link>
          </div>
          
          <div className="flex-1 p-4 space-y-3 overflow-y-auto">
            {result.recommendedProducts.map((prod: any, i: number) => (
              <div key={i} className="group p-3 border border-[#E4E7EC] rounded-xl flex flex-col sm:flex-row gap-4 hover:border-gray-400 transition-all">
                <div className="w-full sm:w-20 h-20 bg-[#F7F8FA] rounded-lg border border-[#E4E7EC] flex items-center justify-center overflow-hidden shrink-0">
                  <div className="text-[10px] text-[#5A6072] text-center font-medium capitalize">{prod.category}</div>
                </div>
                <div className="flex-1 flex flex-col justify-between">
                  <div>
                    <div className="flex justify-between items-start mb-1">
                      <h3 className="text-sm font-bold text-[#1A1D23]">{prod.brand} {prod.model}</h3>
                      <span className="text-[10px] text-white px-2 py-0.5 rounded-full bg-[#1F9254]">موجود</span>
                    </div>
                    <p className="text-[10px] text-[#5A6072] line-clamp-2">{prod.reason}</p>
                  </div>
                  <div className="mt-2 flex justify-between items-end">
                    <div>
                      <p className="text-[10px] text-[#5A6072] mb-0.5">فروشنده: {prod.vendorName} ({prod.vendorCity})</p>
                      <p className="text-sm font-black text-[#1A1D23]">{(prod.price / 10).toLocaleString()} تومان</p>
                    </div>
                    <a 
                      href={`/vendor/${prod.id?.split('_')[0] || 'vendor_001'}`} 
                      className="text-white px-3 py-1.5 rounded-lg text-xs font-bold shadow-sm inline-flex items-center gap-1 transition-transform active:scale-95"
                      style={{ backgroundColor: themePrimary }}
                    >
                      خرید و تماس
                    </a>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="p-5 border-t shrink-0" style={{ backgroundColor: `color-mix(in srgb, ${themePrimary} 10%, transparent)`, borderColor: `color-mix(in srgb, ${themePrimary} 20%, transparent)` }}>
            <div className="flex justify-between items-center">
              <span className="text-sm font-bold text-[#1A1D23]">برآورد هزینه کل تجهیزات:</span>
              <span className="text-xl font-black" style={{ color: themeAccent }}>
                {(result.estimatedTotalCost / 10).toLocaleString()} <span className="text-sm">تومان</span>
              </span>
            </div>
            <p className="text-[9px] text-[#5A6072] mt-1 text-left italic">* شامل کابل‌کشی و هزینه نصب نمی‌باشد.</p>
          </div>
        </section>

        {/* 3. Technical Specs (Bento Square) */}
        <section className="col-span-3 row-span-4 bg-white rounded-2xl border border-[#E4E7EC] p-4 shadow-sm flex flex-col">
          <h3 className="text-sm font-bold text-[#1A1D23] border-b border-[#E4E7EC] pb-2 mb-3 flex items-center gap-2 shrink-0">
            <Info size={16} className="text-[#5A6072]" />
            مشخصات فنی پیشنهادی
          </h3>
          <div className="overflow-y-auto flex-1 pr-1">
            <ul className="space-y-2.5">
              {result.technicalSpecs.map((spec: any, i: number) => (
                <li key={i} className="flex justify-between text-xs items-center gap-4 border-b border-[#F7F8FA] pb-1 last:border-0">
                  <span className="text-[#5A6072]">{spec.label}</span>
                  <span className="font-bold text-left text-[#1A1D23]">{spec.value}</span>
                </li>
              ))}
            </ul>
          </div>
        </section>

        {/* 4. Safety & Warnings (Bento Horizontal) */}
        <section className="col-span-3 row-span-4 bg-white rounded-2xl border border-[#E4E7EC] p-4 shadow-sm flex flex-col">
          <h3 className="text-sm font-bold text-[#D64545] border-b border-[#E4E7EC] pb-2 mb-3 flex items-center gap-2 shrink-0">
            <AlertTriangle size={16} />
            نکات ایمنی و اجرا
          </h3>
          <div className="flex-1 overflow-y-auto pr-1 space-y-2">
            {result.warnings && result.warnings.length > 0 ? (
              result.warnings.map((w: any, i: number) => (
                <div key={i} className={`p-2 rounded-lg ${
                  w.severity === 'error' ? 'bg-[#D64545]/5 text-[#D64545]' :
                  'bg-[#F5A623]/5 border border-[#F5A623]/20 text-[#5A6072]'
                }`}>
                  <p className="text-[10px] leading-relaxed">
                    {w.severity === 'error' ? '⚠️ ' : '* '}{w.message}
                  </p>
                </div>
              ))
            ) : (
              <div className="bg-[#1F9254]/5 p-2 rounded-lg text-[#1F9254]">
                <p className="text-[10px] leading-relaxed">✓ سیستم ایمن ارزیابی شد.</p>
              </div>
            )}
          </div>
          <button className="mt-3 shrink-0 w-full border-2 border-[#1A1D23] text-[#1A1D23] hover:bg-[#1A1D23] hover:text-white transition-colors py-2 rounded-xl text-xs font-black flex items-center justify-center gap-2">
            درخواست بازدید کارشناس 👷‍♂️
          </button>
        </section>

        {/* 5. Accessories Checklist (Bento Small) */}
        <section className="col-span-4 row-span-2 bg-[#12151B] text-white rounded-2xl p-4 shadow-xl flex items-center gap-6">
           <div className="flex-1">
             <h4 className="text-xs font-bold mb-3" style={{ color: themePrimary }}>تجهیزات جانبی مورد نیاز</h4>
             <div className="grid grid-cols-2 gap-x-4 gap-y-2 h-[50px] overflow-y-auto pr-1">
                {result.requiredAccessories.map((acc: any, i: number) => (
                  <div key={i} className={`flex items-center gap-2 text-[10px] ${acc.availableInCatalog ? 'opacity-90' : 'opacity-50'}`}>
                    <span style={{ color: acc.availableInCatalog ? themePrimary : '' }}>
                      {acc.availableInCatalog ? '✓' : '○'}
                    </span> 
                    <span className="truncate">{acc.name}</span>
                  </div>
                ))}
             </div>
           </div>
           <div className="w-px h-12 bg-white/10 shrink-0"></div>
           <div className="flex flex-col items-center shrink-0">
              <div className="text-[10px] opacity-60 mb-2">اشتراک تحلیل</div>
              <button className="bg-white/10 hover:bg-white/20 transition-colors p-2 rounded-lg">
                <Share size={18} />
              </button>
           </div>
        </section>

        {/* 6. Energy Saving Tips */}
        <section className="col-span-4 row-span-2 bg-gradient-to-br from-[#F7F8FA] to-white rounded-2xl border border-[#E4E7EC] p-4 shadow-sm flex flex-col">
          <h3 className="text-sm font-bold text-[#1A1D23] border-b border-[#E4E7EC] pb-2 mb-3 flex items-center gap-2 shrink-0">
            <Lightbulb size={16} className="text-[#F5A623]" />
            پیشنهادات کاهش مصرف
          </h3>
          <div className="flex-1 overflow-y-auto pr-1 space-y-3">
            {result.energySavingTips && result.energySavingTips.length > 0 ? (
              result.energySavingTips.map((tip: any, i: number) => (
                <div key={i} className="bg-white border border-[#E4E7EC] p-2.5 rounded-xl shadow-sm">
                  <h4 className="text-[11px] font-bold text-[#1A1D23] mb-1">{tip.title}</h4>
                  <p className="text-[10px] text-[#5A6072] leading-relaxed">{tip.description}</p>
                </div>
              ))
            ) : (
              <div className="flex items-center justify-center h-full text-[#5A6072] text-[10px]">
                نکته‌ای برای نمایش وجود ندارد.
              </div>
            )}
          </div>
        </section>
        {state.targets.includes('solar') && (
          <EnergyEfficiencyChart 
            monthlyConsumption={result.dailyConsumptionEstimate.monthlyKwh}
            monthlyGeneration={result.dailyConsumptionEstimate.monthlyKwh * 1.15}
          />
        )}
      </div>
      <SmartWarning 
        monthlyKwh={result.dailyConsumptionEstimate.monthlyKwh} 
        targets={state.targets} 
      />
    </motion.div>
  );
}
