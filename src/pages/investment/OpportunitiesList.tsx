import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { InvestmentOpportunity } from '../../types/investment';
import { Loader2, Search, Filter, MapPin, Zap, DollarSign } from 'lucide-react';

export default function OpportunitiesList() {
  const [opportunities, setOpportunities] = useState<InvestmentOpportunity[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchOpportunities();
  }, []);

  const fetchOpportunities = async () => {
    try {
      const res = await fetch('/api/investment/opportunities');
      if (res.ok) {
        
      setOpportunities(await res.json());
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const formatMoney = (val?: number) => {
    if (!val) return 'نامشخص';
    return (val / 1000000).toLocaleString('fa-IR', { maximumFractionDigits: 0 }) + ' م.ت';
  };

  return (
    <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8 font-Vazirmatn">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-black text-gray-900 mb-2">فرصت‌های پروژه انرژی</h1>
          <p className="text-gray-500">کشف و بررسی فرصت‌های سرمایه‌گذاری و مشارکت</p>
        </div>
        
        <div className="flex gap-2 w-full md:w-auto">
          <div className="relative flex-1 md:w-64">
            <Search className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
            <input 
              type="text" 
              placeholder="جستجو در کد یا عنوان..."
              className="w-full pl-4 pr-10 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          <button className="flex items-center justify-center p-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 border border-gray-200 transition-colors">
            <Filter size={20} />
          </button>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center p-12"><Loader2 className="animate-spin text-blue-500" size={40} /></div>
      ) : opportunities.length === 0 ? (
        <div className="text-center py-20 bg-gray-50 rounded-2xl border border-gray-200">
          <p className="text-gray-500">فرصت فعالی یافت نشد.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {opportunities.map(opp => (
            <Link key={opp.id} to={`/investment-hub/opportunities/${opp.id}`} className="bg-white rounded-2xl border border-gray-200 shadow-sm hover:shadow-md hover:border-blue-300 transition-all overflow-hidden flex flex-col group">
              <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-4 border-b border-gray-100 flex justify-between items-start">
                <div>
                  <div className="text-xs font-bold text-blue-600 mb-1">{opp.opportunityCode}</div>
                  <h3 className="font-bold text-gray-900 group-hover:text-blue-700 transition-colors line-clamp-1">{opp.title}</h3>
                </div>
                <span className="px-2 py-1 bg-white text-xs font-bold rounded-md border border-gray-200 text-gray-600 whitespace-nowrap">
                  {opp.projectStage === 'READY_FOR_EPC' ? 'آماده احداث' : opp.projectStage}
                </span>
              </div>
              
              <div className="p-4 flex-1">
                <p className="text-sm text-gray-600 line-clamp-2 mb-4 leading-relaxed">
                  {opp.summary || 'خلاصه اطلاعات ثبت نشده است.'}
                </p>
                
                <div className="space-y-2 mb-4">
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <MapPin size={16} className="text-gray-400" />
                    <span>{opp.location.province}، {opp.location.city}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Zap size={16} className="text-amber-500" />
                    <span dir="ltr" className="font-bold">{opp.targetCapacityKw || '-'} kWp</span>
                    <span className="text-xs text-gray-400 mr-1">(ظرفیت هدف)</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <DollarSign size={16} className="text-emerald-500" />
                    <span>نیاز مالی: <strong className="text-gray-900">{formatMoney(opp.capitalRequirement?.capitalRequired)}</strong></span>
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-2 mt-auto">
                  <div className={`text-[10px] p-1.5 rounded text-center font-bold ${opp.landStatus === 'VERIFIED' ? 'bg-emerald-50 text-emerald-700' : 'bg-gray-100 text-gray-600'}`}>
                    زمین: {opp.landStatus === 'VERIFIED' ? 'تایید شده' : 'بررسی نشده'}
                  </div>
                  <div className={`text-[10px] p-1.5 rounded text-center font-bold ${opp.financialModelStatus === 'COMPLETE' ? 'bg-blue-50 text-blue-700' : 'bg-gray-100 text-gray-600'}`}>
                    مدل مالی: {opp.financialModelStatus === 'COMPLETE' ? 'دارد' : 'ندارد'}
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
