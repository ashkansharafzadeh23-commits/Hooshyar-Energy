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
  Users
} from 'lucide-react';

export default function UserDashboard() {
  const [activeTab, setActiveTab] = useState('requests');
  const [requests, setRequests] = useState<any[]>([]);
  const navigate = useNavigate();

  useEffect(() => {
    const loadedReqs = JSON.parse(localStorage.getItem('epc_requests') || '[]');
    setRequests(loadedReqs.filter((r: any) => r.userId === 'user_1'));
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
            onClick={() => setActiveTab('settings')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-bold transition-colors ${activeTab === 'settings' ? 'bg-blue-50 text-blue-600' : 'text-gray-600 hover:bg-gray-50'}`}
          >
            <Settings size={20} />
            تنظیمات پروفایل
          </button>
        </nav>

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
            </h1>
            <p className="text-gray-500 mt-2">وضعیت درخواست‌های خود را پیگیری کنید.</p>
          </div>
          <Link to="/contractors" className="bg-gray-100 text-gray-700 px-4 py-2.5 rounded-xl hover:bg-gray-200 transition-colors hidden sm:flex items-center gap-2 font-bold shadow-sm border border-gray-200 ml-4">
            لیست پیمانکاران
          </Link>
          <Link to="/powerplant-setup" className="bg-blue-600 text-white px-4 py-2.5 rounded-xl hover:bg-blue-700 transition-colors hidden sm:flex items-center gap-2 font-bold shadow-md">
            ثبت درخواست احداث نیروگاه
          </Link>
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
        <button onClick={() => navigate('/contractors')} className="p-3 rounded-xl flex flex-col items-center gap-1 text-gray-500">
          <Users size={24} />
          <span className="text-[10px] font-bold">پیمانکاران</span>
        </button>
        <button onClick={() => navigate('/')} className="p-3 rounded-xl flex flex-col items-center gap-1 text-gray-500">
          <ArrowRight size={24} />
          <span className="text-[10px] font-bold">بازگشت</span>
        </button>
      </div>
    </div>
  );
}
