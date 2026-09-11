import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom';
import { 
  User, 
  MapPin, 
  Settings, 
  LogOut, 
  FileText, 
  Clock, 
  ArrowRight, 
  Users, 
  Sun, 
  Calendar,
  Briefcase,
  Plus,
  ExternalLink,
  Zap
} from 'lucide-react';
import { STATUS_LABELS } from '../services/projectLifecycleService.js';

export default function UserDashboard() {
  const searchParams = new URLSearchParams(window.location.search);
  const initialTab = searchParams.get('tab') || 'projects';
  const [activeTab, setActiveTab] = useState(initialTab);

  const [requests, setRequests] = useState<any[]>([]);
  const [projects, setProjects] = useState<any[]>([]);
  const [loadingProjects, setLoadingProjects] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const currentTab = searchParams.get('tab');
    if (currentTab && currentTab !== activeTab) {
      setActiveTab(currentTab);
    }
  }, [window.location.search]);

  useEffect(() => {
    try {
      const stored = localStorage.getItem('epc_requests');
      if (stored) {
        const loadedReqs = JSON.parse(stored);
        if (Array.isArray(loadedReqs)) {
          setRequests(loadedReqs.filter((r: any) => r.userId === 'user_1'));
        }
      }
    } catch (e) {
      console.error("Error parsing epc_requests", e);
    }

    fetchProjects();
  }, []);

  const fetchProjects = async () => {
    setLoadingProjects(true);
    try {
      const token = localStorage.getItem('token');
      const res = await fetch('/api/projects', {
        headers: token ? { 'Authorization': `Bearer ${token}` } : {}
      });
      if (res.ok) {
        const data = await res.json();
        setProjects(Array.isArray(data) ? data : []);
      }
    } catch (err) {
      console.error("Error fetching projects", err);
    } finally {
      setLoadingProjects(false);
    }
  };

  const handleConvertAnalysis = async (analysisId: string) => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`/api/projects/from-analysis/${analysisId}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { 'Authorization': `Bearer ${token}` } : {})
        }
      });
      if (res.ok) {
        const project = await res.json();
        navigate(`/projects/${project.id}`);
      } else {
        const err = await res.json();
        alert(err.error || 'خطا در تبدیل تحلیل به پروژه');
      }
    } catch (e) {
      alert('خطا در برقراری ارتباط با سرور');
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'DRAFT': return 'bg-gray-100 text-gray-700 border-gray-200';
      case 'ANALYSIS': return 'bg-blue-50 text-blue-700 border-blue-200';
      case 'FEASIBILITY': return 'bg-indigo-50 text-indigo-700 border-indigo-200';
      case 'READY_FOR_RFQ': return 'bg-amber-50 text-amber-700 border-amber-200';
      case 'RFQ_OPEN': return 'bg-orange-50 text-orange-700 border-orange-200';
      case 'BIDS_RECEIVED': return 'bg-purple-50 text-purple-700 border-purple-200';
      case 'EPC_SELECTED': return 'bg-emerald-50 text-emerald-700 border-emerald-200';
      case 'CONTRACTING': return 'bg-teal-50 text-teal-700 border-teal-200';
      case 'OPERATIONAL': return 'bg-green-50 text-green-700 border-green-200';
      case 'CANCELLED': return 'bg-red-50 text-red-700 border-red-200';
      default: return 'bg-blue-50 text-blue-600 border-blue-100';
    }
  };

  return (
    <div className="min-h-screen bg-[#F7F8FA] font-Vazirmatn flex flex-col md:flex-row pb-20 md:pb-0" dir="rtl">
      {/* Sidebar Navigation */}
      <div className="w-full md:w-64 bg-white border-l border-gray-200 p-6 flex flex-col hidden md:flex shrink-0 min-h-screen sticky top-0">
        <div className="flex flex-col items-center mb-8 border-b border-gray-100 pb-8">
          <div className="w-20 h-20 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center mb-4 shadow-inner">
            <User size={40} />
          </div>
          <h2 className="text-xl font-bold text-gray-800 text-center">پنل مدیریت کارفرما</h2>
          <p className="text-xs text-gray-500 mt-1">مدیریت پروژه‌ها و استعلام‌های انرژی</p>
        </div>

        <nav className="space-y-2 flex-1">
          <button 
            onClick={() => setActiveTab('projects')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-bold transition-colors ${activeTab === 'projects' ? 'bg-blue-50 text-blue-600 shadow-sm' : 'text-gray-600 hover:bg-gray-50'}`}
          >
            <Briefcase size={20} />
            پروژه‌های من
            {projects.length > 0 && (
              <span className="mr-auto bg-blue-100 text-blue-700 text-xs px-2 py-0.5 rounded-full font-bold">
                {projects.length}
              </span>
            )}
          </button>
          
          <button 
            onClick={() => setActiveTab('requests')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-bold transition-colors relative ${activeTab === 'requests' ? 'bg-blue-50 text-blue-600' : 'text-gray-600 hover:bg-gray-50'}`}
          >
            <FileText size={20} />
            درخواست‌های احداث
            {requests.some(r => r.replies && r.replies.length > 0) && (
              <span className="absolute left-4 bg-green-500 text-white text-[10px] w-2 h-2 flex items-center justify-center rounded-full"></span>
            )}
          </button>
          
          <button 
            onClick={() => setActiveTab('history')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-bold transition-colors ${activeTab === 'history' ? 'bg-blue-50 text-blue-600' : 'text-gray-600 hover:bg-gray-50'}`}
          >
            <Clock size={20} />
            تاریخچه تحلیل‌ها
          </button>
          
          <button 
            onClick={() => setActiveTab('assets')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-bold transition-colors ${activeTab === 'assets' ? 'bg-amber-50 text-amber-600' : 'text-gray-600 hover:bg-gray-50'}`}
          >
            <Sun size={20} />
            تجهیزات و پنل‌ها
          </button>
          
          <button 
            onClick={() => setActiveTab('settings')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-bold transition-colors ${activeTab === 'settings' ? 'bg-blue-50 text-blue-600' : 'text-gray-600 hover:bg-gray-50'}`}
          >
            <Settings size={20} />
            تنظیمات پروفایل
          </button>
        </nav>

        <div className="pt-4 border-t border-gray-100 space-y-2">
          <Link 
            to="/target-select" 
            className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl font-bold transition-colors text-sm"
          >
            <ArrowRight size={16} />
            تحلیل انرژی جدید
          </Link>
          <button 
            onClick={() => { localStorage.removeItem('token'); window.location.href = '/'; }}
            className="w-full flex items-center justify-center gap-2 px-4 py-2.5 text-red-600 hover:bg-red-50 rounded-xl font-bold transition-colors text-sm"
          >
            <LogOut size={16} />
            خروج از حساب
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 p-4 md:p-8 overflow-y-auto">
        <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-2xl sm:text-3xl font-black text-gray-800">
              {activeTab === 'projects' && 'پروژه‌های انرژی من'}
              {activeTab === 'requests' && 'درخواست‌های احداث من'}
              {activeTab === 'settings' && 'تنظیمات حساب کاربری'}
              {activeTab === 'assets' && 'تجهیزات و زمان‌بندی تعویض'}
              {activeTab === 'history' && 'تاریخچه محاسبات و تحلیل‌ها'}
            </h1>
            <p className="text-gray-500 mt-1 text-sm">
              {activeTab === 'projects' && 'پروژه‌های مرکزی، پیشرفت مراحل فنی، استعلام‌های EPC و انعقاد قرارداد'}
              {activeTab === 'requests' && 'وضعیت درخواست‌های خود را پیگیری کنید.'}
              {activeTab === 'history' && 'گزارش‌های شبیه‌سازی و امکان‌سنجی تولید انرژی'}
              {activeTab === 'assets' && 'اطلاعات شناسنامه تجهیزات و طول عمر مفید قطعات'}
              {activeTab === 'settings' && 'تنظیمات هویتی و حقوقی سازمان کارفرما'}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Link to="/target-select" className="bg-blue-600 text-white px-4 py-2.5 rounded-xl hover:bg-blue-700 transition-colors flex items-center gap-2 font-bold shadow-sm text-sm">
              <Plus size={16} />
              تحلیل و ایجاد پروژه جدید
            </Link>
            <Link to="/contractors" className="bg-white text-gray-700 border border-gray-200 px-4 py-2.5 rounded-xl hover:bg-gray-50 transition-colors hidden sm:flex items-center gap-2 font-bold shadow-sm text-sm">
              <Users size={16} />
              فهرست پیمانکاران EPC
            </Link>
          </div>
        </header>

        {/* PROJECTS TAB */}
        {activeTab === 'projects' && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
            {loadingProjects ? (
              <div className="bg-white p-12 rounded-2xl border border-gray-100 text-center text-gray-500 font-bold">
                در حال دریافت پروژه‌ها...
              </div>
            ) : projects.length === 0 ? (
              <div className="bg-white p-8 rounded-2xl border border-gray-200 shadow-sm text-center py-16">
                <div className="w-20 h-20 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <Briefcase size={40} />
                </div>
                <h3 className="text-xl font-black text-gray-800 mb-2">هنوز پروژه‌ای ثبت نکرده‌اید</h3>
                <p className="text-gray-500 text-sm max-w-md mx-auto mb-6">
                  برای شروع، یک تحلیل هوشمند انرژی خورشیدی انجام دهید و آن را مستقیماً به پروژه رسمی HSE تبدیل کنید.
                </p>
                <Link to="/target-select" className="inline-flex items-center gap-2 bg-blue-600 text-white px-6 py-3 rounded-xl font-bold hover:bg-blue-700 transition-colors shadow-md">
                  <Plus size={18} />
                  شروع محاسبه و ایجاد پروژه
                </Link>
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-4">
                {projects.map((proj) => {
                  const statusLabel = STATUS_LABELS[proj.status] || proj.status;
                  const statusClass = getStatusColor(proj.status);
                  const locationText = proj.location ? `${proj.location.province || ''} - ${proj.location.city || ''}` : 'نامشخص';

                  return (
                    <div 
                      key={proj.id} 
                      className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm hover:shadow-md transition-all flex flex-col md:flex-row md:items-center justify-between gap-6"
                    >
                      <div className="space-y-2">
                        <div className="flex items-center gap-3">
                          <span className="font-mono text-xs font-bold text-blue-600 bg-blue-50 px-2.5 py-1 rounded-lg border border-blue-100">
                            {proj.projectCode || 'HSE-IR-000000'}
                          </span>
                          <span className={`text-xs px-3 py-1 rounded-full font-bold border ${statusClass}`}>
                            {statusLabel}
                          </span>
                        </div>
                        <h3 className="text-lg font-black text-gray-900">{proj.title}</h3>
                        
                        <div className="flex flex-wrap items-center gap-4 text-xs text-gray-500 pt-1">
                          <span className="flex items-center gap-1">
                            <MapPin size={14} className="text-gray-400" />
                            {locationText}
                          </span>
                          <span className="flex items-center gap-1">
                            <Zap size={14} className="text-amber-500" />
                            ظرفیت هدف: {proj.targetCapacityKw ? `${proj.targetCapacityKw} کیلووات` : 'تعیین نشده'}
                          </span>
                          <span className="flex items-center gap-1">
                            <Calendar size={14} className="text-gray-400" />
                            تاریخ ایجاد: {new Date(proj.createdAt).toLocaleDateString('fa-IR')}
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center gap-3 shrink-0">
                        <Link 
                          to={`/projects/${proj.id}`}
                          className="bg-blue-600 text-white px-5 py-2.5 rounded-xl font-bold hover:bg-blue-700 transition-colors text-sm flex items-center gap-2 shadow-sm"
                        >
                          ورود به فضای کار
                          <ExternalLink size={16} />
                        </Link>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </motion.div>
        )}

        {/* REQUESTS TAB */}
        {activeTab === 'requests' && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
            {requests.length === 0 ? (
              <div className="bg-white p-8 rounded-2xl border border-gray-100 shadow-sm text-center py-20">
                <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6 text-gray-400">
                  <FileText size={48} />
                </div>
                <h2 className="text-xl font-bold text-gray-800 mb-2">درخواستی یافت نشد</h2>
                <p className="text-gray-500 mb-6">شما هنوز هیچ درخواستی برای احداث نیروگاه ثبت نکرده‌اید.</p>
                <Link to="/powerplant-setup" className="bg-blue-600 text-white px-6 py-3 rounded-xl hover:bg-blue-700 transition-colors inline-block font-bold shadow-md">
                  ثبت اولین درخواست
                </Link>
              </div>
            ) : (
              requests.map((req) => (
                <div key={req.id} className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex flex-col gap-4">
                  <div className="flex items-center justify-between border-b border-gray-100 pb-4">
                    <div>
                      <h3 className="font-bold text-gray-800 text-lg">درخواست احداث نیروگاه در {req.city}</h3>
                      <p className="text-sm text-gray-500 mt-1 flex items-center gap-1">
                        <Clock size={14} /> ارسال شده در {new Date(req.createdAt).toLocaleDateString('fa-IR')}
                      </p>
                    </div>
                    <span className={`px-3 py-1 rounded-full text-xs font-bold ${req.replies && req.replies.length > 0 ? 'bg-green-50 text-green-600' : 'bg-gray-100 text-gray-600'}`}>
                      {req.replies && req.replies.length > 0 ? `${req.replies.length} پیشنهاد جدید` : 'در انتظار بررسی EPC'}
                    </span>
                  </div>
                  
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 bg-gray-50 p-4 rounded-xl">
                    <div>
                      <span className="text-xs text-gray-500 block mb-1">متراژ</span>
                      <span className="font-bold text-gray-800">{req.area} متر مربع</span>
                    </div>
                    <div>
                      <span className="text-xs text-gray-500 block mb-1">نوع اتصال</span>
                      <span className="font-bold text-gray-800">{req.connectionType === 'on-grid' ? 'متصل به شبکه' : 'منفصل از شبکه'}</span>
                    </div>
                    <div>
                      <span className="text-xs text-gray-500 block mb-1">نوع سقف</span>
                      <span className="font-bold text-gray-800">{req.roofType === 'flat' ? 'مسطح' : req.roofType === 'sloped' ? 'شیب‌دار' : 'زمین مسطح'}</span>
                    </div>
                    <div>
                      <span className="text-xs text-gray-500 block mb-1">بودجه تخمینی</span>
                      <span className="font-bold text-gray-800">{req.budget} {req.budgetUnit === 'million' ? 'میلیون' : 'میلیارد'} تومان</span>
                    </div>
                  </div>
                </div>
              ))
            )}
          </motion.div>
        )}

        {/* ASSETS TAB */}
        {activeTab === 'assets' && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
            <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 bg-amber-100 text-amber-600 rounded-xl flex items-center justify-center">
                  <Sun size={24} />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-gray-800">وضعیت پنل‌های خورشیدی</h3>
                  <p className="text-sm text-gray-500">محاسبه عمر مفید و زمان تعویض تجهیزات</p>
                </div>
              </div>

              {projects.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  شما هنوز پروژه عملیاتی یا تایید شده‌ای ندارید.
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {projects.map((proj) => (
                    <div key={proj.id} className="border border-gray-200 rounded-xl p-5 relative overflow-hidden">
                      <div className="absolute top-0 right-0 w-2 h-full bg-amber-500"></div>
                      <div className="flex justify-between items-start mb-4">
                        <div>
                          <h4 className="font-bold text-gray-800">{proj.title}</h4>
                          <div className="text-xs text-gray-500 mt-1 flex items-center gap-1">
                            <MapPin size={12} /> {proj.location?.city || 'ایران'}
                          </div>
                        </div>
                        <div className="bg-green-50 text-green-600 px-3 py-1 rounded-full text-xs font-bold border border-green-100">
                          {STATUS_LABELS[proj.status] || proj.status}
                        </div>
                      </div>

                      <div className="space-y-3">
                        <div className="flex justify-between items-center text-sm">
                          <span className="text-gray-500">کد پروژه:</span>
                          <span className="font-mono font-bold text-blue-600">{proj.projectCode}</span>
                        </div>
                        <div className="flex justify-between items-center text-sm">
                          <span className="text-gray-500">عمر مفید تخمینی:</span>
                          <span className="font-bold text-amber-600">۲۵ سال</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </motion.div>
        )}
        
        {/* HISTORY TAB */}
        {activeTab === 'history' && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
            <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-gray-800">تاریخچه تحلیل‌های قبلی</h2>
                <Link to="/target-select" className="text-blue-600 text-sm font-bold flex items-center gap-1 hover:underline">
                  <Plus size={16} /> تحلیل جدید
                </Link>
              </div>
              {(() => {
                let history = [];
                try {
                  const stored = localStorage.getItem('analysis_history');
                  history = stored ? JSON.parse(stored) : [];
                } catch(e) {}
                
                if (history.length === 0) {
                  return (
                    <div className="text-center py-8 text-gray-500">
                      تاریخچه‌ای از تحلیل‌های قبلی شما برای نمایش وجود ندارد.
                    </div>
                  );
                }
                
                return (
                  <div className="space-y-4">
                    {history.map((item, idx) => (
                      <div key={idx} className="border border-gray-200 rounded-xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-gray-50 transition-colors">
                        <div>
                          <h4 className="font-bold text-gray-800">{item.title || 'تحلیل پتانسیل خورشیدی'}</h4>
                          <div className="text-sm text-gray-500 mt-1 flex flex-wrap gap-4">
                            <span>{new Date(item.date).toLocaleDateString('fa-IR')}</span>
                            <span>{item.input?.city || 'مکان نامشخص'}</span>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <button 
                            onClick={() => navigate('/result', { state: { historyResult: item.result, historyResultId: item.id } })}
                            className="text-xs font-bold text-blue-600 bg-blue-50 px-3 py-2 rounded-xl hover:bg-blue-100 transition-colors"
                          >
                            مشاهده نتیجه
                          </button>
                          {item.id && (
                            <button 
                              onClick={() => handleConvertAnalysis(item.id)}
                              className="text-xs font-bold text-emerald-700 bg-emerald-50 px-3 py-2 rounded-xl hover:bg-emerald-100 transition-colors flex items-center gap-1"
                            >
                              <Briefcase size={14} />
                              تبدیل به پروژه
                            </button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                );
              })()}
            </div>
          </motion.div>
        )}
        
        {/* SETTINGS TAB */}
        {activeTab === 'settings' && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="bg-white p-8 rounded-2xl border border-gray-100 shadow-sm text-center py-16">
            <h2 className="text-2xl font-bold text-gray-800 mb-2">تنظیمات پروفایل و سازمان</h2>
            <p className="text-gray-500 max-w-md mx-auto text-sm">
              اطلاعات حساب کاربری، سازمان حقوقی و دسترسی‌های تیمی شما در این بخش مدیریت می‌شوند.
            </p>
          </motion.div>
        )}
      </div>

      {/* Mobile Navigation Bar */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 p-2 flex justify-around items-center z-50">
        <button onClick={() => setActiveTab('projects')} className={`p-2 rounded-xl flex flex-col items-center gap-1 ${activeTab === 'projects' ? 'text-blue-600' : 'text-gray-500'}`}>
          <Briefcase size={20} />
          <span className="text-[10px] font-bold">پروژه‌ها</span>
        </button>
        <button onClick={() => setActiveTab('requests')} className={`p-2 rounded-xl flex flex-col items-center gap-1 ${activeTab === 'requests' ? 'text-blue-600' : 'text-gray-500'}`}>
          <FileText size={20} />
          <span className="text-[10px] font-bold">درخواست‌ها</span>
        </button>
        <button onClick={() => setActiveTab('history')} className={`p-2 rounded-xl flex flex-col items-center gap-1 ${activeTab === 'history' ? 'text-blue-600' : 'text-gray-500'}`}>
          <Clock size={20} />
          <span className="text-[10px] font-bold">تاریخچه</span>
        </button>
        <button onClick={() => navigate('/target-select')} className="p-2 rounded-xl flex flex-col items-center gap-1 text-gray-500">
          <Zap size={20} />
          <span className="text-[10px] font-bold">تحلیل جدید</span>
        </button>
        <button onClick={() => { localStorage.removeItem('token'); window.location.href = '/'; }} className="p-2 rounded-xl flex flex-col items-center gap-1 text-red-500">
          <LogOut size={20} />
          <span className="text-[10px] font-bold">خروج</span>
        </button>
      </div>
    </div>
  );
}
