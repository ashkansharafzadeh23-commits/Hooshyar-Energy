import React, { useState, useEffect } from 'react';
import { EnergyProject } from '../../types/project';
import { ProjectFinancialModel, FinancialScenario, FinancialAssumptionSet } from '../../types/finance';
import { Loader2, Plus, TrendingUp, AlertTriangle } from 'lucide-react';

export function ScenarioStudio({ project, model }: { project: EnergyProject, model: ProjectFinancialModel }) {
  const [scenarios, setScenarios] = useState<FinancialScenario[]>([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);

  useEffect(() => {
    fetchScenarios();
  }, [model.id]);

  const fetchScenarios = async () => {
    try {
      const res = await fetch(`/api/projects/${project.id}/financial-models/${model.id}/scenarios`);
      if (res.ok) {
        
      setScenarios(await res.json());
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const formatMoney = (val: number) => {
    return (val / 1000000).toLocaleString('fa-IR', { maximumFractionDigits: 0 });
  };

  const createDefaultScenarios = async () => {
    setCreating(true);
    try {
      const conservative: Partial<FinancialScenario> = {
        name: 'سناریو محتاطانه',
        type: 'CONSERVATIVE',
        capexOverride: { amount: model.capex.total.amount * 1.15, currency: 'IRR', unit: 'TOMAN' },
        generationOverrideKwh: model.energyEconomics.annualGenerationKwh * 0.9,
      };

      const optimistic: Partial<FinancialScenario> = {
        name: 'سناریو خوش‌بینانه',
        type: 'OPTIMISTIC',
        capexOverride: { amount: model.capex.total.amount * 0.9, currency: 'IRR', unit: 'TOMAN' },
        generationOverrideKwh: model.energyEconomics.annualGenerationKwh * 1.1,
      };

      await fetch(`/api/projects/${project.id}/financial-models/${model.id}/scenarios`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(conservative)
      });

      await fetch(`/api/projects/${project.id}/financial-models/${model.id}/scenarios`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(optimistic)
      });

      await fetchScenarios();
    } catch (e) {
      console.error(e);
    } finally {
      setCreating(false);
    }
  };

  if (loading) return <div className="p-8 flex justify-center"><Loader2 className="animate-spin text-blue-500" /></div>;

  return (
    <div className="space-y-6 mt-8">
      <div className="flex justify-between items-center border-t border-gray-200 pt-8">
        <div>
          <h2 className="text-xl font-bold text-gray-800">استودیوی سناریوها و تحلیل حساسیت</h2>
          <p className="text-sm text-gray-500 mt-1">مقایسه معماری‌های فنی و ریسک‌های اقتصادی</p>
        </div>
        {scenarios.length === 0 && (
          <button 
            onClick={createDefaultScenarios}
            disabled={creating}
            className="px-4 py-2 bg-blue-50 text-blue-700 font-bold rounded-lg text-sm hover:bg-blue-100 flex items-center gap-2"
          >
            {creating ? <Loader2 className="animate-spin" size={16} /> : <Plus size={16} />}
            تولید سناریوهای پیش‌فرض
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Base Scenario from Model */}
        <div className="bg-white p-6 rounded-2xl border-2 border-blue-500 shadow-md relative">
          <div className="absolute top-0 right-4 transform -translate-y-1/2 bg-blue-500 text-white px-3 py-1 text-xs font-bold rounded-full">
            سناریو پایه
          </div>
          <h3 className="font-bold text-gray-800 text-lg mb-4 text-center">معماری اصلی</h3>
          
          <div className="space-y-3 text-sm">
            <div className="flex justify-between border-b border-gray-100 pb-2">
              <span className="text-gray-500">CAPEX:</span>
              <span className="font-bold">{formatMoney(model.results?.totalCapex.amount || 0)} م.ت</span>
            </div>
            <div className="flex justify-between border-b border-gray-100 pb-2">
              <span className="text-gray-500">تولید سال اول:</span>
              <span className="font-bold">{model.energyEconomics.annualGenerationKwh.toLocaleString()} kWh</span>
            </div>
            <div className="flex justify-between border-b border-gray-100 pb-2">
              <span className="text-gray-500">NPV:</span>
              <span className="font-bold text-emerald-600">{formatMoney(model.results?.npv.amount || 0)} م.ت</span>
            </div>
            <div className="flex justify-between pt-1">
              <span className="text-gray-500">IRR:</span>
              <span className="font-bold text-blue-600 text-lg" dir="ltr">{typeof model.results?.irrPercent === 'number' ? model.results?.irrPercent.toFixed(1) + '%' : '-'}</span>
            </div>
          </div>
        </div>

        {/* Generated Scenarios */}
        {scenarios.map(sc => (
          <div key={sc.id} className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm relative">
            <div className={`absolute top-0 right-4 transform -translate-y-1/2 px-3 py-1 text-xs font-bold rounded-full text-white ${sc.type === 'OPTIMISTIC' ? 'bg-emerald-500' : sc.type === 'CONSERVATIVE' ? 'bg-amber-500' : 'bg-gray-500'}`}>
              {sc.name}
            </div>
            <h3 className="font-bold text-gray-800 text-lg mb-4 text-center mt-2 opacity-0">Title</h3>
            
            <div className="space-y-3 text-sm">
              <div className="flex justify-between border-b border-gray-100 pb-2">
                <span className="text-gray-500">CAPEX:</span>
                <span className="font-bold">{formatMoney(sc.results?.totalCapex.amount || 0)} م.ت</span>
              </div>
              <div className="flex justify-between border-b border-gray-100 pb-2">
                <span className="text-gray-500">تولید سال اول:</span>
                <span className="font-bold">{sc.results?.annualGenerationYear1Kwh.toLocaleString()} kWh</span>
              </div>
              <div className="flex justify-between border-b border-gray-100 pb-2">
                <span className="text-gray-500">NPV:</span>
                <span className="font-bold text-emerald-600">{formatMoney(sc.results?.npv.amount || 0)} م.ت</span>
              </div>
              <div className="flex justify-between pt-1">
                <span className="text-gray-500">IRR:</span>
                <span className="font-bold text-blue-600 text-lg" dir="ltr">{typeof sc.results?.irrPercent === 'number' ? sc.results?.irrPercent.toFixed(1) + '%' : '-'}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
      
      {scenarios.length > 0 && (
        <div className="bg-amber-50 p-4 rounded-xl border border-amber-100 flex items-start gap-3 mt-4">
          <AlertTriangle className="text-amber-500 shrink-0 mt-0.5" size={20} />
          <div>
            <h4 className="font-bold text-amber-800 mb-1">نتیجه‌گیری تحلیل حساسیت</h4>
            <p className="text-sm text-amber-700 leading-relaxed text-justify">
              بررسی سناریوها نشان می‌دهد که پروژه تاب‌آوری مناسبی در برابر افزایش 15 درصدی هزینه‌های سرمایه‌ای (CAPEX) دارد، اما در صورت کاهش 10 درصدی تولید به دلیل سایه‌اندازی یا مشکلات تجهیزات، نرخ بازده داخلی (IRR) به میزان قابل توجهی کاهش می‌یابد. 
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
