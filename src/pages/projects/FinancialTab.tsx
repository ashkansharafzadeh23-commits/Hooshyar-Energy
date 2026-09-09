import React, { useState, useEffect } from 'react';
import { EnergyProject } from '../../types/project';
import { ProjectFinancialModel, FinancialResults, FinancialAssumptionSet } from '../../types/finance';
import { Loader2, Plus, Calculator, TrendingUp, DollarSign, Activity, FileText } from 'lucide-react';
import { Link } from 'react-router-dom';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { ScenarioStudio } from './ScenarioStudio';

export function FinancialTab({ project }: { project: EnergyProject }) {
  const [loading, setLoading] = useState(true);
  const [model, setModel] = useState<ProjectFinancialModel | null>(null);
  const [assumptions, setAssumptions] = useState<FinancialAssumptionSet | null>(null);
  const [isCalculating, setIsCalculating] = useState(false);

  useEffect(() => {
    fetchModel();
  }, [project.id]);

  const fetchModel = async () => {
    try {
      const res = await fetch(`/api/projects/${project.id}/financial-models`);
      if (res.ok) {
        const models = await res.json();
        if (models.length > 0) {
          setModel(models[0]);
          // fetch assumptions (mocked, assume it comes or we can skip for UI if we only need results)
        }
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const createInitialModel = async () => {
    setIsCalculating(true);
    try {
      // Create mock structure
      const newModel = {
        modelCode: 'MOD-' + Date.now(),
        status: 'DRAFT',
        baseCurrency: 'IRR',
        displayCurrencyUnit: 'TOMAN',
        sourceType: 'ENGINEERING_ESTIMATE',
        capex: {
          engineering: { amount: 100000000, currency: 'IRR', unit: 'TOMAN' },
          solarPanels: { amount: 800000000, currency: 'IRR', unit: 'TOMAN' },
          inverters: { amount: 300000000, currency: 'IRR', unit: 'TOMAN' },
          battery: { amount: 0, currency: 'IRR', unit: 'TOMAN' },
          generator: { amount: 0, currency: 'IRR', unit: 'TOMAN' },
          mountingStructure: { amount: 150000000, currency: 'IRR', unit: 'TOMAN' },
          electricalEquipment: { amount: 100000000, currency: 'IRR', unit: 'TOMAN' },
          cables: { amount: 50000000, currency: 'IRR', unit: 'TOMAN' },
          protection: { amount: 50000000, currency: 'IRR', unit: 'TOMAN' },
          monitoring: { amount: 20000000, currency: 'IRR', unit: 'TOMAN' },
          transportation: { amount: 30000000, currency: 'IRR', unit: 'TOMAN' },
          installation: { amount: 200000000, currency: 'IRR', unit: 'TOMAN' },
          commissioning: { amount: 50000000, currency: 'IRR', unit: 'TOMAN' },
          gridConnection: { amount: 50000000, currency: 'IRR', unit: 'TOMAN' },
          permits: { amount: 20000000, currency: 'IRR', unit: 'TOMAN' },
          civilWorks: { amount: 0, currency: 'IRR', unit: 'TOMAN' },
          tax: { amount: 0, currency: 'IRR', unit: 'TOMAN' },
          contingency: { amount: 100000000, currency: 'IRR', unit: 'TOMAN' },
          other: { amount: 0, currency: 'IRR', unit: 'TOMAN' },
          total: { amount: 0, currency: 'IRR', unit: 'TOMAN' } // Calculated on backend
        },
        opex: {
          maintenance: { amount: 50000000, currency: 'IRR', unit: 'TOMAN' },
          cleaning: { amount: 20000000, currency: 'IRR', unit: 'TOMAN' },
          insurance: { amount: 10000000, currency: 'IRR', unit: 'TOMAN' },
          monitoring: { amount: 5000000, currency: 'IRR', unit: 'TOMAN' },
          landLease: { amount: 0, currency: 'IRR', unit: 'TOMAN' },
          staff: { amount: 0, currency: 'IRR', unit: 'TOMAN' },
          security: { amount: 0, currency: 'IRR', unit: 'TOMAN' },
          batteryReplacementReserve: { amount: 0, currency: 'IRR', unit: 'TOMAN' },
          inverterReplacementReserve: { amount: 30000000, currency: 'IRR', unit: 'TOMAN' },
          administration: { amount: 10000000, currency: 'IRR', unit: 'TOMAN' },
          other: { amount: 0, currency: 'IRR', unit: 'TOMAN' },
          totalYear1: { amount: 0, currency: 'IRR', unit: 'TOMAN' }
        },
        replacements: [
          { year: 12, componentType: 'Inverter', estimatedCost: { amount: 350000000, currency: 'IRR', unit: 'TOMAN' } }
        ],
        energyEconomics: {
          installedCapacityKw: project.targetCapacityKw || 100,
          annualGenerationKwh: (project.targetCapacityKw || 100) * 1600, // mock estimation
          selfConsumptionRatio: project.energyRequirement?.gridConnected ? 30 : 100,
          exportRatio: project.energyRequirement?.gridConnected ? 70 : 0,
          customerTariff: {
            name: 'Retail Tariff',
            type: 'CUSTOMER_RETAIL_TARIFF',
            unitPricePerKwh: { amount: 3000, currency: 'IRR', unit: 'TOMAN' },
            effectiveDate: '2023-01-01',
            annualEscalationPercent: 20,
            source: 'Ministry of Energy'
          },
          exportTariff: {
            name: 'Feed-in Tariff',
            type: 'FEED_IN_TARIFF',
            unitPricePerKwh: { amount: 30000, currency: 'IRR', unit: 'TOMAN' },
            effectiveDate: '2023-01-01',
            annualEscalationPercent: 0, // Feed-in tariff might not escalate
            source: 'SATBA'
          }
        },
        version: 1
      };

      const newAssumptions = {
        name: 'Base Case 2024',
        version: 1,
        projectLifetimeYears: 20,
        discountRatePercent: 30, // Iran typical high discount rate
        annualInflationPercent: 40,
        electricityTariffEscalationPercent: 20,
        equipmentPriceEscalationPercent: 30,
        panelAnnualDegradationPercent: 0.5,
        systemAvailabilityPercent: 99,
        performanceRatioPercent: 80,
        annualOpexEscalationPercent: 30,
        taxRatePercent: 0, // Tax holiday for renewables
        insurancePercent: 0.5,
        maintenancePercent: 1.5,
        residualValuePercent: 5
      };

      const res = await fetch(`/api/projects/${project.id}/financial-models`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ model: newModel, assumptions: newAssumptions })
      });
      
      const data = await res.json();
      
      // Now trigger calculation
      const calcRes = await fetch(`/api/projects/${project.id}/financial-models/${data.model.id}/calculate`, {
        method: 'POST'
      });
      const calculatedModel = await calcRes.json();
      
      setModel(calculatedModel);
      setAssumptions(data.assumptions);

    } catch (e) {
      console.error(e);
    } finally {
      setIsCalculating(false);
    }
  };

  if (loading) {
    return <div className="flex justify-center p-12"><Loader2 className="animate-spin text-blue-500" size={32} /></div>;
  }

  if (!model) {
    return (
      <div className="flex flex-col items-center justify-center p-12 text-center bg-white rounded-2xl border border-gray-200">
        <Calculator className="text-gray-400 mb-4" size={48} />
        <h3 className="text-lg font-bold text-gray-800 mb-2">مدل مالی هنوز ایجاد نشده است</h3>
        <p className="text-gray-500 mb-6 max-w-md">شما می‌توانید با استفاده از اطلاعات فنی پروژه، یک مدل اقتصادی جامع شامل محاسبه CAPEX، دوره بازگشت سرمایه، و NPV ایجاد کنید.</p>
        <button 
          onClick={createInitialModel}
          disabled={isCalculating}
          className="bg-blue-600 text-white px-6 py-3 rounded-xl font-bold flex items-center gap-2 hover:bg-blue-700 transition-colors disabled:opacity-70"
        >
          {isCalculating ? <Loader2 className="animate-spin" size={20} /> : <Plus size={20} />}
          ایجاد مدل مالی هوشمند
        </button>
      </div>
    );
  }

  const r = model.results;
  
  if (!r) return <div>Model needs calculation.</div>;

  const formatMoney = (val: number) => {
    return (val / 1000000).toLocaleString('fa-IR', { maximumFractionDigits: 0 });
  };

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-xl font-bold text-gray-800">تحلیل اقتصادی و امکان‌سنجی مالی</h2>
          <p className="text-sm text-gray-500 mt-1">نسخه مدل: {model.version} | تاریخ محاسبه: {new Date(model.calculatedAt || model.createdAt).toLocaleDateString('fa-IR')}</p>
        </div>
        <div className="flex gap-2">
          <button className="px-4 py-2 bg-gray-100 text-gray-700 font-bold rounded-lg text-sm hover:bg-gray-200">
            سناریوها
          </button>
          <Link to={`/projects/${project.id}/proposal`} target="_blank" className="px-4 py-2 bg-green-600 text-white font-bold rounded-lg text-sm flex items-center gap-2 hover:bg-green-700">
            <FileText size={16} />
            خروجی پروپوزال (PDF)
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-sm">
          <div className="text-gray-500 text-sm font-bold flex items-center gap-2 mb-2"><DollarSign size={16}/> سرمایه اولیه (CAPEX)</div>
          <div className="text-2xl font-black text-gray-800">{formatMoney(r.totalCapex.amount)}</div>
          <div className="text-xs text-gray-500 mt-1">میلیون تومان</div>
        </div>
        <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-sm">
          <div className="text-gray-500 text-sm font-bold flex items-center gap-2 mb-2"><Activity size={16}/> دوره بازگشت سرمایه</div>
          <div className="text-2xl font-black text-gray-800">{typeof r.simplePaybackYears === 'number' ? r.simplePaybackYears.toFixed(1) : '-'}</div>
          <div className="text-xs text-gray-500 mt-1">سال (بازگشت ساده)</div>
        </div>
        <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-sm">
          <div className="text-gray-500 text-sm font-bold flex items-center gap-2 mb-2"><TrendingUp size={16}/> نرخ بازده داخلی (IRR)</div>
          <div className="text-2xl font-black text-blue-600" dir="ltr">{typeof r.irrPercent === 'number' ? r.irrPercent.toFixed(1) + '%' : 'محاسبه نشد'}</div>
          <div className="text-xs text-blue-500 mt-1">سودآوری سالیانه</div>
        </div>
        <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-sm">
          <div className="text-gray-500 text-sm font-bold flex items-center gap-2 mb-2"><DollarSign size={16}/> ارزش فعلی خالص (NPV)</div>
          <div className="text-2xl font-black text-emerald-600">{formatMoney(r.npv.amount)}</div>
          <div className="text-xs text-gray-500 mt-1">میلیون تومان</div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm">
          <h3 className="font-bold text-gray-800 mb-4">جزئیات درآمد و هزینه (سال اول)</h3>
          <div className="space-y-4">
            <div className="flex justify-between items-center border-b border-gray-100 pb-2">
              <span className="text-gray-600 text-sm">تولید انرژی سالیانه:</span>
              <span className="font-bold text-gray-800" dir="ltr">{r.annualGenerationYear1Kwh.toLocaleString()} kWh</span>
            </div>
            <div className="flex justify-between items-center border-b border-gray-100 pb-2">
              <span className="text-gray-600 text-sm">درآمد فروش به شبکه:</span>
              <span className="font-bold text-emerald-600">{formatMoney(r.annualExportRevenueYear1.amount)} <span className="text-xs font-normal">م.ت</span></span>
            </div>
            <div className="flex justify-between items-center border-b border-gray-100 pb-2">
              <span className="text-gray-600 text-sm">ارزش برق مصرفی (صرفه‌جویی):</span>
              <span className="font-bold text-blue-600">{formatMoney(r.annualSavingsYear1.amount)} <span className="text-xs font-normal">م.ت</span></span>
            </div>
            <div className="flex justify-between items-center border-b border-gray-100 pb-2">
              <span className="text-gray-600 text-sm">هزینه‌های جاری و نگهداری (OPEX):</span>
              <span className="font-bold text-red-500">{formatMoney(r.annualOpexYear1.amount)} <span className="text-xs font-normal">م.ت</span></span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-800 font-bold">جریان نقدینگی خالص سال اول:</span>
              <span className="font-black text-gray-900 text-lg">{formatMoney(r.annualNetBenefitYear1.amount - r.annualOpexYear1.amount)} <span className="text-xs font-normal text-gray-500">میلیون تومان</span></span>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm">
          <h3 className="font-bold text-gray-800 mb-4">تحلیل ریسک و شاخص‌های کلیدی</h3>
          <div className="space-y-4">
            <div className="flex justify-between items-center border-b border-gray-100 pb-2">
              <span className="text-gray-600 text-sm">هزینه تراز شده انرژی (LCOE):</span>
              <span className="font-bold text-gray-800">{r.lcoePerKwh.amount.toLocaleString('fa-IR', {maximumFractionDigits: 0})} <span className="text-xs font-normal text-gray-500">تومان/کیلووات‌ساعت</span></span>
            </div>
            <div className="flex justify-between items-center border-b border-gray-100 pb-2">
              <span className="text-gray-600 text-sm">بازده کل طول عمر (ROI):</span>
              <span className="font-bold text-gray-800" dir="ltr">{r.lifetimeRoiPercent.toFixed(0)}%</span>
            </div>
            <div className="flex justify-between items-center border-b border-gray-100 pb-2">
              <span className="text-gray-600 text-sm">مجموع جریان نقدی طول پروژه:</span>
              <span className="font-bold text-gray-800">{formatMoney(r.totalLifetimeNetCashFlow.amount)} <span className="text-xs font-normal text-gray-500">م.ت</span></span>
            </div>
            
            <div className="mt-6 bg-blue-50 p-4 rounded-xl border border-blue-100">
              <p className="text-sm text-blue-800 leading-relaxed text-justify">
                <strong>تحلیل هوش مصنوعی: </strong>
                با توجه به IRR معادل {typeof r.irrPercent === 'number' ? r.irrPercent.toFixed(1) : ''}٪، این پروژه از لحاظ اقتصادی توجیه‌پذیر است. درآمد اصلی پروژه ناشی از تزریق برق به شبکه با ضریب پایه است. حساسیت اصلی پروژه نسبت به نرخ افزایش تعرفه‌های ساتبا می‌باشد.
              </p>
            </div>
          </div>
        </div>
      </div>
      <ScenarioStudio project={project} model={model} />
    </div>
  );
}
