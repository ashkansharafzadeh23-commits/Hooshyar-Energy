import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom';
import { 
  User, 
  MapPin, 
  Settings, 
  LogOut, 
  FileText, 
  CheckCircle,
  Clock,
  ArrowRight,
  Users,
  Sun,
  Calendar
} from 'lucide-react';

export default function UserDashboard() {
  
  const searchParams = new URLSearchParams(window.location.search);
  const initialTab = searchParams.get('tab') || 'requests';
  const [activeTab, setActiveTab] = useState(initialTab);

  const [requests, setRequests] = useState<any[]>([]);
  const navigate = useNavigate();

  useEffect(() => {
    try {
      const stored = localStorage.getItem('epc_requests');
      if (stored) {
        const loadedReqs = stored ? JSON.parse(stored) : [];
        if (Array.isArray(loadedReqs)) {
          setRequests(loadedReqs.filter((r: any) => r.userId === 'user_1'));
        }
      }
    } catch (e) {
      console.error("Error parsing epc_requests", e);
    }
  }, []);

  return (
    <div className="min-h-screen bg-[#F7F8FA] font-Vazirmatn flex flex-col md:flex-row pb-20 md:pb-0">
      {/* Sidebar Navigation */}
      <div className="w-full md:w-64 bg-white border-l border-gray-200 p-6 flex flex-col hidden md:flex shrink-0 min-h-screen sticky top-0">
        <div className="flex flex-col items-center mb-8 border-b border-gray-100 pb-8">
          <div className="w-20 h-20 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center mb-4">
            <User size={40} />
          </div>
          <h2 className="text-xl font-bold text-gray-800 text-center">پنل کاربری</h2>
          <p className="text-sm text-gray-500 mt-1">مدیریت درخواست‌ها</p>
        </div>

        <nav className="space-y-2 flex-1">
          <button 
            onClick={() => setActiveTab('requests')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-bold transition-colors relative ${activeTab === 'requests' ? 'bg-blue-50 text-blue-600' : 'text-gray-600 hover:bg-gray-50'}`}
          >
            <FileText size={20} />
            درخواست‌های من
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
        <button 
          onClick={() => { localStorage.removeItem('token'); window.location.href = '/'; }}
          className="w-full flex items-center justify-center gap-2 px-4 py-3 text-red-500 bg-red-50 hover:bg-red-100 rounded-xl font-bold transition-colors mt-auto mb-3"
        >
          <LogOut size={20} />
          خروج از حساب
        </button>

        <button onClick={() => navigate('/target-select')} className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl font-bold transition-colors mt-auto mb-3">
          <ArrowRight size={20} />
          بازگشت به خانه
        </button>

        <button className="w-full flex items-center justify-center gap-2 px-4 py-3 text-red-500 hover:bg-red-50 rounded-xl font-bold transition-colors">
          <LogOut size={20} />
          خروج از حساب
        </button>
      </div>

      {/* Main Content */}
      <div className="flex-1 p-4 md:p-8 overflow-y-auto">
        <header className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl sm:text-3xl font-black text-gray-800">
              {activeTab === 'requests' && 'درخواست‌های احداث من'}
              {activeTab === 'settings' && 'تنظیمات حساب کاربری'}
              {activeTab === 'assets' && 'تجهیزات و زمان‌بندی تعویض'}
            </h1>
            <p className="text-gray-500 mt-2">وضعیت درخواست‌های خود را پیگیری کنید.</p>
          </div>
          <div className="flex items-center gap-3">
            <Link to="/" className="bg-white text-gray-700 px-4 py-2.5 rounded-xl hover:bg-gray-50 transition-colors hidden sm:flex items-center gap-2 font-bold shadow-sm border border-gray-200">
              <ArrowRight size={18} />
              خانه
            </Link>
            <Link to="/contractors" className="bg-gray-100 text-gray-700 px-4 py-2.5 rounded-xl hover:bg-gray-200 transition-colors hidden sm:flex items-center gap-2 font-bold shadow-sm border border-gray-200">
              لیست پیمانکاران
            </Link>
            <Link to="/powerplant-setup" className="bg-blue-600 text-white px-4 py-2.5 rounded-xl hover:bg-blue-700 transition-colors hidden md:flex items-center gap-2 font-bold shadow-md">
              ثبت درخواست احداث
            </Link>
          </div>
        </header>

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

                  {req.replies && req.replies.length > 0 ? (
                    <div className="mt-4">
                      <h4 className="font-bold text-gray-700 text-sm mb-3">پیشنهادات دریافت شده از شرکت‌های مجری:</h4>
                      <div className="space-y-4">
                        {req.replies.map((reply: any, i: number) => (
                          <div key={i} className="bg-blue-50/50 p-4 rounded-xl border border-blue-100">
                            <div className="flex justify-between items-start mb-2">
                              <div className="flex items-center gap-2">
                                <CheckCircle size={16} className="text-green-500" />
                                <span className="font-bold text-sm text-gray-800">{reply.epcName}</span>
                              </div>
                              <span className="text-xs text-gray-400">{new Date(reply.createdAt).toLocaleDateString('fa-IR')}</span>
                            </div>
                            <p className="text-sm text-gray-700 mt-2 leading-relaxed bg-white p-3 rounded-lg border border-gray-100">{reply.message}</p>
                            <div className="mt-3 flex justify-end">
                              <button className="text-sm font-bold text-blue-600 hover:text-blue-700 px-3 py-1.5 bg-blue-100 rounded-lg transition-colors">
                                تایید پیشنهاد و ارتباط
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  ) : (
                    <div className="mt-2 text-center text-gray-500 text-sm py-4">
                      هنوز پیشنهادی از سوی شرکت‌های مجری ثبت نشده است.
                    </div>
                  )}
                </div>
              ))
            )}
          </motion.div>
        )}

        {activeTab === 'assets' && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
            <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 bg-amber-100 text-amber-600 rounded-xl flex items-center justify-center">
                  <Sun size={24} />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-gray-800">وضعیت پنل‌های خورشیدی</h3>
                  <p className="text-sm text-gray-500">محاسبه عمر مفید و زمان تعویض</p>
                </div>
              </div>

              {requests.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  شما هنوز درخواست احداث تکمیل شده‌ای ندارید.
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {requests.filter(r => r.status === 'تایید شده' || r.status === 'در حال بررسی').length > 0 ? requests.filter(r => r.status === 'تایید شده' || r.status === 'در حال بررسی').map((req: any) => {
                    const installDate = req.date || new Date().toLocaleDateString('fa-IR');
                    // Mocking lifespan: roughly 25 years. We'll show a random start year or just pretend it was installed recently.
                    const remainingYears = 25; // 25 years default lifespan
                    return (
                      <div key={req.id} className="border border-gray-200 rounded-xl p-5 relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-2 h-full bg-amber-500"></div>
                        <div className="flex justify-between items-start mb-4">
                          <div>
                            <h4 className="font-bold text-gray-800">پروژه {req.id}</h4>
                            <div className="text-xs text-gray-500 mt-1 flex items-center gap-1">
                              <MapPin size={12} /> {req.location || 'تهران'}
                            </div>
                          </div>
                          <div className="bg-green-50 text-green-600 px-3 py-1 rounded-full text-xs font-bold border border-green-100">
                            فعال
                          </div>
                        </div>

                        <div className="space-y-3">
                          <div className="flex justify-between items-center text-sm">
                            <span className="text-gray-500">نوع سیستم:</span>
                            <span className="font-bold">{req.systemType === 'ongrid' ? 'متصل به شبکه' : 'منفصل از شبکه'}</span>
                          </div>
                          <div className="flex justify-between items-center text-sm">
                            <span className="text-gray-500">تاریخ نصب:</span>
                            <span className="font-bold flex items-center gap-1">
                              <Calendar size={14} className="text-gray-400"/> {installDate}
                            </span>
                          </div>
                          <div className="flex justify-between items-center text-sm">
                            <span className="text-gray-500">عمر مفید تخمینی:</span>
                            <span className="font-bold text-amber-600">۲۵ سال</span>
                          </div>
                          
                          <div className="mt-4 pt-4 border-t border-gray-100">
                            <div className="flex justify-between text-xs mb-1">
                              <span className="text-gray-500">زمان باقی‌مانده تا تعویض:</span>
                              <span className="font-bold text-emerald-600">{remainingYears} سال</span>
                            </div>
                            <div className="w-full bg-gray-100 rounded-full h-2">
                              <div className="bg-emerald-500 h-2 rounded-full" style={{ width: '95%' }}></div>
                            </div>
                            <p className="text-[10px] text-gray-400 mt-2">
                              * پیشنهاد می‌شود در سال {remainingYears - 5}ام عملکرد پنل‌ها بررسی شود.
                            </p>
                          </div>
                        </div>
                      </div>
                    );
                  }) : (
                    <div className="col-span-2 text-center py-8 text-gray-500">
                      شما هنوز پروژه فعال یا تایید شده‌ای ندارید.
                    </div>
                  )}
                </div>
              )}
            </div>
          </motion.div>
        )}
        
        {activeTab === 'history' && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
            <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm">
              <h2 className="text-2xl font-bold text-gray-800 mb-6">تاریخچه تحلیل‌های قبلی</h2>
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
                      <div key={idx} className="border border-gray-200 rounded-xl p-4 flex justify-between items-center hover:bg-gray-50 transition-colors cursor-pointer" onClick={() => {
                        navigate('/result', { state: { historyResult: item.result } });
                      }}>
                        <div>
                           <h4 className="font-bold text-gray-800">{item.title}</h4>
                           <div className="text-sm text-gray-500 mt-1 flex gap-4">
                             <span>{new Date(item.date).toLocaleDateString('fa-IR')} - {new Date(item.date).toLocaleTimeString('fa-IR', {hour: '2-digit', minute:'2-digit'})}</span>
                             <span>{item.input?.city || 'مکان نامشخص'}</span>
                           </div>
                        </div>
                        <div className="flex items-center gap-2">
                           <span className="text-xs font-bold text-blue-600 bg-blue-50 px-2 py-1 rounded-lg">مشاهده</span>
                        </div>
                      </div>
                    ))}
                  </div>
                );
              })()}
            </div>
          </motion.div>
        )}
        
        {activeTab === 'settings' && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="bg-white p-8 rounded-2xl border border-gray-100 shadow-sm text-center py-20">
            <h2 className="text-2xl font-bold text-gray-800 mb-2">تنظیمات پروفایل</h2>
            <p className="text-gray-500 max-w-md mx-auto">
              این بخش در حال توسعه است.
            </p>
          </motion.div>
        )}
      </div>

      {/* Mobile Navigation Bar */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 p-2 flex justify-around items-center z-50">
        <button onClick={() => setActiveTab('requests')} className={`p-3 rounded-xl flex flex-col items-center gap-1 relative ${activeTab === 'requests' ? 'text-blue-600' : 'text-gray-500'}`}>
          <FileText size={24} />
          {requests.some(r => r.replies && r.replies.length > 0) && (
            <span className="absolute top-2 right-2 bg-green-500 text-white text-[8px] w-3 h-3 flex items-center justify-center rounded-full"></span>
          )}
          <span className="text-[10px] font-bold">درخواست‌ها</span>
        </button>
        <button onClick={() => setActiveTab('settings')} className={`p-3 rounded-xl flex flex-col items-center gap-1 ${activeTab === 'settings' ? 'text-blue-600' : 'text-gray-500'}`}>
          <Settings size={24} />
          <span className="text-[10px] font-bold">تنظیمات</span>
        </button>
        <button onClick={() => setActiveTab('history')} className={`p-3 rounded-xl flex flex-col items-center gap-1 ${activeTab === 'history' ? 'text-blue-600' : 'text-gray-500'}`}>
          <Clock size={24} />
          <span className="text-[10px] font-bold">تاریخچه</span>
        </button>
        <button onClick={() => navigate('/contractors')} className="p-3 rounded-xl flex flex-col items-center gap-1 text-gray-500">
          <Users size={24} />
          <span className="text-[10px] font-bold">پیمانکاران</span>
        </button>
        <button onClick={() => navigate('/target-select')} className="p-3 rounded-xl flex flex-col items-center gap-1 text-gray-500">
          <ArrowRight size={24} />
          <span className="text-[10px] font-bold">بازگشت</span>
        </button>
        <button onClick={() => { localStorage.removeItem('token'); window.location.href = '/'; }} className="p-3 rounded-xl flex flex-col items-center gap-1 text-red-500">
          <LogOut size={24} />
          <span className="text-[10px] font-bold">خروج</span>
        </button>
      </div>
    </div>
  );
}
