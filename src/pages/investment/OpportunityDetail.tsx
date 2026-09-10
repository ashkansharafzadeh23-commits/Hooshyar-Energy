import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { InvestmentOpportunity, ProjectReadinessScore } from '../../types/investment';
import { Loader2, ArrowRight, ShieldAlert, FileText, Lock, ChevronLeft, MapPin, Zap, DollarSign } from 'lucide-react';

export default function OpportunityDetail() {
  const { id } = useParams();
  const [opp, setOpp] = useState<InvestmentOpportunity | null>(null);
  const [readiness, setReadiness] = useState<ProjectReadinessScore | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, [id]);

  const fetchData = async () => {
    try {
      const [oppRes, readRes] = await Promise.all([
        fetch(`/api/investment/opportunities/${id}`),
        fetch(`/api/investment/opportunities/${id}/readiness`)
      ]);
      if (oppRes.ok) setOpp(await oppRes.json());
      if (readRes.ok) setReadiness(await readRes.json());
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="p-12 flex justify-center"><Loader2 className="animate-spin text-blue-500" size={40} /></div>;
  if (!opp) return <div className="p-12 text-center">فرصت یافت نشد.</div>;

  const formatMoney = (val?: number) => {
    if (!val) return 'نامشخص';
    return (val / 1000000).toLocaleString('fa-IR', { maximumFractionDigits: 0 }) + ' م.ت';
  };

  return (
    <div className="max-w-6xl mx-auto py-8 px-4 sm:px-6 lg:px-8 font-Vazirmatn">
      <Link to="/investment-hub/opportunities" className="inline-flex items-center gap-2 text-gray-500 hover:text-gray-900 mb-6 transition-colors">
        <ArrowRight size={20} />
        بازگشت به فرصت‌ها
      </Link>

      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden mb-8">
        <div className="bg-gradient-to-r from-slate-900 to-indigo-900 p-8 md:p-12 text-white">
          <div className="flex flex-col md:flex-row justify-between items-start gap-6">
            <div>
              <div className="text-indigo-300 font-mono mb-2">{opp.opportunityCode}</div>
              <h1 className="text-3xl font-black mb-4">{opp.title}</h1>
              <div className="flex flex-wrap gap-4 text-sm text-slate-300">
                <span className="flex items-center gap-1"><MapPin size={16} /> {opp.location.province}، {opp.location.city}</span>
                <span className="flex items-center gap-1"><Zap size={16} /> {opp.targetCapacityKw || '-'} kWp</span>
                <span className="px-2 py-0.5 bg-indigo-500/30 rounded border border-indigo-500/50">{opp.projectStage}</span>
              </div>
            </div>
            <div className="bg-white/10 backdrop-blur border border-white/20 p-6 rounded-2xl text-center w-full md:w-64">
              <div className="text-sm text-indigo-200 mb-2">امتیاز آمادگی پروژه</div>
              <div className="text-5xl font-black text-white">{readiness?.score || 0}</div>
              <div className="text-xs text-indigo-200 mt-2">از ۱۰۰</div>
            </div>
          </div>
        </div>

        <div className="p-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
            
            <div className="lg:col-span-2 space-y-10">
              <section>
                <h2 className="text-xl font-bold text-gray-900 mb-4">خلاصه پروژه</h2>
                <p className="text-gray-600 leading-relaxed text-justify">
                  {opp.summary || 'خلاصه اطلاعات ثبت نشده است.'}
                </p>
              </section>

              <section>
                <h2 className="text-xl font-bold text-gray-900 mb-4">نیاز مالی و سرمایه</h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="bg-gray-50 p-4 rounded-xl border border-gray-100">
                    <div className="text-xs text-gray-500 mb-1">CAPEX کل پروژه</div>
                    <div className="text-lg font-bold text-gray-900">{formatMoney(opp.capitalRequirement?.totalProjectCapex)}</div>
                  </div>
                  <div className="bg-gray-50 p-4 rounded-xl border border-gray-100">
                    <div className="text-xs text-gray-500 mb-1">آورده مالک</div>
                    <div className="text-lg font-bold text-gray-900">{formatMoney(opp.capitalRequirement?.ownerEquity)}</div>
                  </div>
                  <div className="bg-indigo-50 p-4 rounded-xl border border-indigo-100">
                    <div className="text-xs text-indigo-600 mb-1">سرمایه مورد نیاز</div>
                    <div className="text-lg font-black text-indigo-900">{formatMoney(opp.capitalRequirement?.capitalRequired)}</div>
                  </div>
                </div>
              </section>

              <section>
                <h2 className="text-xl font-bold text-gray-900 mb-4">وضعیت آمادگی</h2>
                <div className="bg-gray-50 rounded-xl border border-gray-100 p-6">
                  {readiness ? (
                    <div className="space-y-4">
                      {Object.entries(readiness.scoreBreakdown).map(([key, val]) => (
                        <div key={key} className="flex items-center gap-4">
                          <div className="w-24 text-sm text-gray-600 capitalize">{key}</div>
                          <div className="flex-1 h-3 bg-gray-200 rounded-full overflow-hidden">
                            <div className="h-full bg-blue-500 rounded-full" style={{ width: `${val}%` }}></div>
                          </div>
                          <div className="w-10 text-right text-sm font-bold text-gray-700">{val}%</div>
                        </div>
                      ))}
                      
                      {readiness.missingItems.length > 0 && (
                        <div className="mt-6 pt-6 border-t border-gray-200">
                          <h4 className="font-bold text-amber-800 mb-3 flex items-center gap-2">
                            <ShieldAlert size={18} /> نواقص و ریسک‌ها
                          </h4>
                          <ul className="list-disc list-inside text-sm text-amber-700 space-y-1">
                            {readiness.missingItems.map((item, i) => <li key={i}>{item}</li>)}
                          </ul>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="text-gray-500 text-sm">اطلاعات آمادگی موجود نیست.</div>
                  )}
                </div>
              </section>

            </div>

            <div className="space-y-6">
              <div className="bg-gray-50 p-6 rounded-2xl border border-gray-200">
                <h3 className="font-bold text-gray-900 mb-4">دسترسی و ارتباط</h3>
                <p className="text-sm text-gray-600 mb-6 leading-relaxed">
                  برای مشاهده مدارک فنی، حقوقی و مالی کامل پروژه (Data Room) و ارتباط با مالک، اعلام علاقه‌مندی کنید.
                </p>
                <button className="w-full bg-blue-600 text-white font-bold py-3 px-4 rounded-xl hover:bg-blue-700 transition-colors mb-3">
                  اعلام علاقه‌مندی
                </button>
                <button className="w-full bg-white text-blue-600 font-bold py-3 px-4 rounded-xl border border-blue-200 hover:bg-blue-50 transition-colors">
                  درخواست معرفی
                </button>
              </div>

              <div className="bg-white p-6 rounded-2xl border border-gray-200">
                <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
                  <Lock size={18} className="text-gray-400" />
                  اتاق داده (Data Room)
                </h3>
                <div className="space-y-3">
                  {['مدارک زمین', 'مدل مالی پایه', 'مجوز احداث اولیه', 'مشخصات مختصات جغرافیایی'].map((doc, i) => (
                    <div key={i} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-gray-100">
                      <div className="flex items-center gap-2 text-sm text-gray-700">
                        <FileText size={16} className="text-gray-400" />
                        {doc}
                      </div>
                      <Lock size={14} className="text-gray-400" />
                    </div>
                  ))}
                </div>
                <p className="text-xs text-gray-400 mt-4 text-center">
                  دسترسی پس از تایید مالک امکان‌پذیر است.
                </p>
              </div>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}
