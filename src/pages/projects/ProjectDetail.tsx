import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { EnergyProject } from '../../types/project';
import { FinancialTab } from './FinancialTab';
import { ContractTab } from './Workspace/ContractTab';
import { MilestonesTab } from './Workspace/MilestonesTab';
import { DataRoomTab } from './Workspace/DataRoomTab';
import { ProcurementTab } from './Workspace/ProcurementTab';
import { CommissioningTab } from './Workspace/CommissioningTab';
import { HandoverTab } from './Workspace/HandoverTab';
import { AssetTab } from './Workspace/AssetTab';
import { ProjectStatusBadge } from '../../components/ProjectStatusBadge';
import { ArrowRight, FileText, Activity, Users, Settings, Map } from 'lucide-react';

export default function ProjectDetail() {
  const { id } = useParams();
  const [project, setProject] = useState<EnergyProject | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    const fetchProject = async () => {
      try {
        const token = localStorage.getItem('token');
        const res = await fetch(`/api/projects/\${id}`, {
          headers: { 'Authorization': `Bearer \${token}` }
        });
        if (res.ok) {
          const data = await res.json();
          setProject(data);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchProject();
  }, [id]);

  if (loading) return <div className="p-8 text-center min-h-screen bg-[#F7F8FA]">در حال بارگذاری...</div>;
  if (!project) return <div className="p-8 text-center min-h-screen bg-[#F7F8FA]">پروژه یافت نشد.</div>;

  const tabs = [
    { id: 'overview', label: 'اطلاعات کلی' },
    { id: 'analysis', label: 'تحلیل انرژی' },
    { id: 'engineering', label: 'مهندسی' },
    { id: 'financial', label: 'مالی و امکان‌سنجی' },
    { id: 'documents', label: 'اسناد' },
    { id: 'activity', label: 'تاریخچه فعالیت' },
    { id: 'rfq', label: 'استعلام (به‌زودی)', disabled: true },
    { id: 'bids', label: 'پیشنهادها (به‌زودی)', disabled: true },
    { id: 'investment', label: 'سرمایه‌گذاری (به‌زودی)', disabled: true },
    { id: 'procurement', label: 'تأمین', disabled: false },
    { id: 'commissioning', label: 'راه‌اندازی', disabled: false },
    { id: 'handover', label: 'تحویل', disabled: false },
    { id: 'asset', label: 'دارایی انرژی', disabled: false },
    { id: 'contract', label: 'قرارداد (EPC)' },
    { id: 'milestones', label: 'مایل‌استون‌ها' },
    { id: 'monitoring', label: 'مانیتورینگ (به‌زودی)', disabled: true },
  ];

  return (
    <div className="min-h-screen bg-[#F7F8FA] font-Vazirmatn pb-20">
      <div className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center gap-4">
            <Link to="/dashboard?tab=projects" className="p-2 hover:bg-gray-100 rounded-full transition-colors">
              <ArrowRight size={20} className="text-gray-600" />
            </Link>
            <div>
              <div className="flex items-center gap-3">
                <h1 className="text-xl font-bold text-gray-900">{project.title}</h1>
                <ProjectStatusBadge status={project.status} />
              </div>
              <p className="text-sm text-gray-500 mt-1 font-mono">
                کد پروژه: {project.projectCode}
              </p>
            </div>
          </div>
          
          <div className="flex overflow-x-auto gap-2 mt-6 pb-2 scrollbar-hide">
            {tabs.map(tab => (
              <button
                key={tab.id}
                disabled={tab.disabled}
                onClick={() => setActiveTab(tab.id)}
                className={`whitespace-nowrap px-4 py-2 rounded-lg text-sm font-bold transition-colors \${
                  activeTab === tab.id 
                    ? 'bg-[#09090B] text-white' 
                    : tab.disabled 
                      ? 'bg-gray-50 text-gray-400 cursor-not-allowed border border-gray-100'
                      : 'bg-white text-gray-600 hover:bg-gray-50 border border-gray-200'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {activeTab === 'overview' && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">

            <div className="bg-gradient-to-br from-slate-900 to-slate-800 p-6 rounded-2xl border border-slate-700 shadow-lg text-white md:col-span-3">
              <div className="flex items-center gap-2 mb-4 text-slate-300">
                <Activity size={18} />
                <h3 className="font-bold">داشبورد اجرایی هوشیار (Workspace)</h3>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="bg-white/10 p-4 rounded-xl backdrop-blur-sm">
                  <div className="text-xs text-slate-400 mb-1">وضعیت سلامت</div>
                  <div className="text-lg font-bold text-emerald-400">در مسیر (ON_TRACK)</div>
                </div>
                <div className="bg-white/10 p-4 rounded-xl backdrop-blur-sm">
                  <div className="text-xs text-slate-400 mb-1">فاز جاری</div>
                  <div className="text-lg font-bold text-blue-400">انعقاد قرارداد EPC</div>
                </div>
                <div className="bg-white/10 p-4 rounded-xl backdrop-blur-sm">
                  <div className="text-xs text-slate-400 mb-1">مایل‌استون بعدی</div>
                  <div className="text-lg font-bold text-slate-200">تامین تجهیزات</div>
                </div>
                <div className="bg-white/10 p-4 rounded-xl backdrop-blur-sm">
                  <div className="text-xs text-slate-400 mb-1">هوش مصنوعی</div>
                  <div className="text-sm font-bold text-slate-300 line-clamp-2">
                    «بر اساس بررسی سیستم، قرارداد آماده فعال‌سازی است و تاخیری پیش‌بینی نمی‌شود.»
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm">
              <h3 className="font-bold text-gray-800 mb-4 flex items-center gap-2"><Map size={18}/> موقعیت مکانی</h3>
              <div className="space-y-3 text-sm">
                <div className="flex justify-between"><span className="text-gray-500">استان:</span> <span className="font-bold">{project.location.province}</span></div>
                <div className="flex justify-between"><span className="text-gray-500">شهر:</span> <span className="font-bold">{project.location.city}</span></div>
                <div className="flex justify-between"><span className="text-gray-500">نوع کاربری:</span> <span className="font-bold">{project.site?.type}</span></div>
                <div className="flex justify-between"><span className="text-gray-500">مساحت (مترمربع):</span> <span className="font-bold">{project.site?.areaM2}</span></div>
              </div>
            </div>
            
            <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm">
              <h3 className="font-bold text-gray-800 mb-4 flex items-center gap-2"><Activity size={18}/> مشخصات فنی</h3>
              <div className="space-y-3 text-sm">
                <div className="flex justify-between"><span className="text-gray-500">نوع سیستم:</span> <span className="font-bold">{project.projectType}</span></div>
                <div className="flex justify-between"><span className="text-gray-500">ظرفیت هدف:</span> <span className="font-bold">{project.targetCapacityKw} kW</span></div>
                <div className="flex justify-between"><span className="text-gray-500">مصرف ماهیانه:</span> <span className="font-bold">{project.energyRequirement?.monthlyConsumptionKwh} kWh</span></div>
                <div className="flex justify-between"><span className="text-gray-500">وضعیت شبکه:</span> <span className="font-bold">{project.energyRequirement?.gridConnected ? 'متصل' : 'منفصل'}</span></div>
              </div>
            </div>

            <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm">
              <h3 className="font-bold text-gray-800 mb-4 flex items-center gap-2"><FileText size={18}/> مالی و زمان‌بندی</h3>
              <div className="space-y-3 text-sm">
                <div className="flex justify-between"><span className="text-gray-500">بودجه تخمینی:</span> <span className="font-bold">{project.estimatedBudgetIRR ? (project.estimatedBudgetIRR / 1000000).toLocaleString() + ' میلیون تومان' : 'نامشخص'}</span></div>
                <div className="flex justify-between"><span className="text-gray-500">تاریخ ایجاد:</span> <span className="font-bold">{new Date(project.createdAt).toLocaleDateString('fa-IR')}</span></div>
                <div className="flex justify-between"><span className="text-gray-500">آخرین بروزرسانی:</span> <span className="font-bold">{new Date(project.updatedAt).toLocaleDateString('fa-IR')}</span></div>
              </div>
            </div>
          </div>
        )}
        
        {activeTab === 'financial' && <FinancialTab project={project} />}
        {activeTab === 'contract' && <ContractTab projectId={project.id} />}
        {activeTab === 'milestones' && <MilestonesTab projectId={project.id} />}
        {activeTab === 'documents' && <DataRoomTab projectId={project.id} />}
        {activeTab === 'procurement' && <ProcurementTab projectId={project.id} />}
        {activeTab === 'commissioning' && <CommissioningTab projectId={project.id} />}
        {activeTab === 'handover' && <HandoverTab projectId={project.id} />}
        {activeTab === 'asset' && <AssetTab projectId={project.id} />}
        {activeTab !== 'overview' && activeTab !== 'financial' && activeTab !== 'contract' && activeTab !== 'milestones' && activeTab !== 'documents' && activeTab !== 'procurement' && activeTab !== 'commissioning' && activeTab !== 'handover' && activeTab !== 'asset' && !tabs.find(t => t.id === activeTab)?.disabled && (
          <div className="bg-white p-12 rounded-2xl border border-gray-200 shadow-sm text-center">
            <p className="text-gray-500">محتوای این بخش هنوز تکمیل نشده است.</p>
          </div>
        )}
      </div>
    </div>
  );
}
