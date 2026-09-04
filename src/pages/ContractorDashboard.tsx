import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { 
  Building2, 
  MapPin, 
  Star, 
  Settings, 
  LogOut, 
  Briefcase, 
  Users, 
  CheckCircle,
  FileText,
  MessageSquare,
  TrendingUp,
  Clock,
  Plus
} from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, ResponsiveContainer, Tooltip } from 'recharts';
import { useEffect } from 'react';

const mockData = [
  { name: 'فروردین', projects: 2, income: 400 },
  { name: 'اردیبهشت', projects: 3, income: 600 },
  { name: 'خرداد', projects: 2, income: 500 },
  { name: 'تیر', projects: 5, income: 900 },
  { name: 'مرداد', projects: 4, income: 750 },
];

export default function ContractorDashboard() {
  const [activeTab, setActiveTab] = useState('overview');
  const [requests, setRequests] = useState<any[]>([]);
  const [replyText, setReplyText] = useState<{ [key: string]: string }>({});

  useEffect(() => {
    const loadedReqs = JSON.parse(localStorage.getItem('epc_requests') || '[]');
    setRequests(loadedReqs);
  }, []);

  const handleReply = (reqId: string) => {
    if (!replyText[reqId]) return;
    const currentReqs = JSON.parse(localStorage.getItem('epc_requests') || '[]');
    const updatedReqs = currentReqs.map((req: any) => {
      if (req.id === reqId) {
        return {
          ...req,
          replies: [
            ...(req.replies || []),
            {
              epcName: 'مهندسی نیروپژوهان',
              message: replyText[reqId],
              createdAt: new Date().toISOString()
            }
          ]
        };
      }
      return req;
    });
    localStorage.setItem('epc_requests', JSON.stringify(updatedReqs));
    setRequests(updatedReqs);
    setReplyText({ ...replyText, [reqId]: '' });
  };


  return (
    <div className="min-h-screen bg-[#F7F8FA] font-Vazirmatn flex flex-col md:flex-row pb-20 md:pb-0">
      {/* Sidebar Navigation */}
      <div className="w-full md:w-64 bg-white border-l border-gray-200 p-6 flex flex-col hidden md:flex shrink-0 min-h-screen sticky top-0">
        <div className="flex flex-col items-center mb-8 border-b border-gray-100 pb-8">
          <div className="w-20 h-20 bg-amber-100 text-amber-600 rounded-full flex items-center justify-center mb-4">
            <Building2 size={40} />
          </div>
          <h2 className="text-xl font-bold text-gray-800 text-center">مهندسی نیروپژوهان</h2>
          <p className="text-sm text-gray-500 mt-1">توسعه نیروگاه‌های صنعتی</p>
          <div className="mt-3 flex items-center gap-1 bg-amber-50 text-amber-600 px-3 py-1 rounded-full text-xs font-bold">
            <Star size={14} className="fill-amber-600" />
            ۴.۸ (۸۹ نظر)
          </div>
        </div>

        <nav className="space-y-2 flex-1">
          <button 
            onClick={() => setActiveTab('overview')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-bold transition-colors ${activeTab === 'overview' ? 'bg-amber-50 text-amber-600' : 'text-gray-600 hover:bg-gray-50'}`}
          >
            <TrendingUp size={20} />
            داشبورد
          </button>
          <button 
            onClick={() => setActiveTab('projects')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-bold transition-colors ${activeTab === 'projects' ? 'bg-amber-50 text-amber-600' : 'text-gray-600 hover:bg-gray-50'}`}
          >
            <Briefcase size={20} />
            پروژه‌های من
          </button>
          <button 
            onClick={() => setActiveTab('requests')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-bold transition-colors relative ${activeTab === 'requests' ? 'bg-amber-50 text-amber-600' : 'text-gray-600 hover:bg-gray-50'}`}
          >
            <FileText size={20} />
            درخواست‌های جدید
            <span className="absolute left-4 bg-red-500 text-white text-[10px] w-5 h-5 flex items-center justify-center rounded-full">۳</span>
          </button>
          <button 
            onClick={() => setActiveTab('messages')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-bold transition-colors ${activeTab === 'messages' ? 'bg-amber-50 text-amber-600' : 'text-gray-600 hover:bg-gray-50'}`}
          >
            <MessageSquare size={20} />
            پیام‌ها
          </button>
          <button 
            onClick={() => setActiveTab('settings')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-bold transition-colors ${activeTab === 'settings' ? 'bg-amber-50 text-amber-600' : 'text-gray-600 hover:bg-gray-50'}`}
          >
            <Settings size={20} />
            تنظیمات پروفایل
          </button>
        </nav>

        <Link to="/target-select" className="w-full flex items-center gap-3 px-4 py-3 text-red-500 hover:bg-red-50 rounded-xl font-bold transition-colors mt-auto">
          <LogOut size={20} />
          خروج از حساب
        </Link>
      </div>

      {/* Main Content */}
      <div className="flex-1 p-4 md:p-8 overflow-y-auto">
        <header className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl sm:text-3xl font-black text-gray-800">
              {activeTab === 'overview' && 'داشبورد مدیریت'}
              {activeTab === 'projects' && 'پروژه‌های در حال اجرا و تکمیل شده'}
              {activeTab === 'requests' && 'درخواست‌های احداث نیروگاه'}
              {activeTab === 'messages' && 'پیام‌ها و چت'}
              {activeTab === 'settings' && 'تنظیمات حساب کاربری'}
            </h1>
            <p className="text-gray-500 mt-2">به پنل مدیریت شرکت‌های EPC خوش آمدید.</p>
          </div>
          <button className="bg-amber-500 text-white p-3 rounded-xl hover:bg-amber-600 transition-colors hidden sm:flex items-center gap-2 font-bold shadow-md">
            <Plus size={20} />
            افزودن نمونه کار جدید
          </button>
        </header>

        {activeTab === 'overview' && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex flex-col">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-bold text-gray-600">پروژه‌های فعال</h3>
                  <div className="w-10 h-10 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center">
                    <Briefcase size={20} />
                  </div>
                </div>
                <div className="text-3xl font-black text-gray-800">۴</div>
              </div>
              
              <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex flex-col">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-bold text-gray-600">پروژه‌های موفق</h3>
                  <div className="w-10 h-10 bg-green-50 text-green-600 rounded-full flex items-center justify-center">
                    <CheckCircle size={20} />
                  </div>
                </div>
                <div className="text-3xl font-black text-gray-800">۶۲</div>
              </div>

              <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex flex-col">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-bold text-gray-600">درخواست‌های جدید</h3>
                  <div className="w-10 h-10 bg-amber-50 text-amber-600 rounded-full flex items-center justify-center">
                    <FileText size={20} />
                  </div>
                </div>
                <div className="text-3xl font-black text-gray-800">۳</div>
              </div>

              <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex flex-col">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-bold text-gray-600">بازدید از پروفایل</h3>
                  <div className="w-10 h-10 bg-purple-50 text-purple-600 rounded-full flex items-center justify-center">
                    <Users size={20} />
                  </div>
                </div>
                <div className="text-3xl font-black text-gray-800">۱۲۸</div>
              </div>
            </div>

            <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
              <h2 className="text-lg font-bold text-gray-800 mb-6">روند احداث و درآمدزایی (میلیون تومان)</h2>
              <div className="h-72 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={mockData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                    <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#888' }} />
                    <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#888' }} />
                    <Tooltip formatter={(value) => [`${value} میلیون`, 'درآمد']} />
                    <Area type="monotone" dataKey="income" stroke="#f59e0b" fill="#fef3c7" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-lg font-bold text-gray-800">آخرین درخواست‌های احداث</h2>
                <button className="text-amber-600 font-bold text-sm hover:text-amber-700" onClick={() => setActiveTab('requests')}>
                  مشاهده همه
                </button>
              </div>
              <div className="space-y-4">
                {[1, 2].map((req) => (
                  <div key={req} className="flex flex-col sm:flex-row sm:items-center justify-between p-4 border border-gray-100 rounded-xl hover:bg-gray-50 transition-colors gap-4">
                    <div className="flex items-start gap-4">
                      <div className="w-12 h-12 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center shrink-0">
                        <MapPin size={24} />
                      </div>
                      <div>
                        <h3 className="font-bold text-gray-800">نیروگاه 200 کیلوواتی سوله صنعتی</h3>
                        <p className="text-sm text-gray-500 mt-1 flex items-center gap-1">
                          <Clock size={14} /> ارسال شده در ۲ ساعت پیش • تهران، شهرک صنعتی شمس آباد
                        </p>
                      </div>
                    </div>
                    <button className="bg-amber-500 hover:bg-amber-600 text-white px-4 py-2 rounded-lg font-bold text-sm transition-colors w-full sm:w-auto">
                      بررسی و ارائه پیشنهاد
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        )}

        {/* Other tabs can be simplified for this view */}
        
        {activeTab === 'requests' && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
            {requests.length === 0 ? (
              <div className="bg-white p-8 rounded-2xl border border-gray-100 shadow-sm text-center py-20">
                <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6 text-gray-400">
                  <FileText size={48} />
                </div>
                <h2 className="text-xl font-bold text-gray-800 mb-2">درخواستی یافت نشد</h2>
                <p className="text-gray-500">در حال حاضر هیچ درخواست جدیدی برای احداث نیروگاه ثبت نشده است.</p>
              </div>
            ) : (
              requests.map((req) => (
                <div key={req.id} className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex flex-col gap-4">
                  <div className="flex items-center justify-between border-b border-gray-100 pb-4">
                    <div>
                      <h3 className="font-bold text-gray-800 text-lg">درخواست احداث نیروگاه - شناسه {req.id.substring(req.id.length - 4)}</h3>
                      <p className="text-sm text-gray-500 mt-1 flex items-center gap-1">
                        <Clock size={14} /> ثبت شده در {new Date(req.createdAt).toLocaleDateString('fa-IR')}
                      </p>
                    </div>
                    <span className="bg-blue-50 text-blue-600 px-3 py-1 rounded-full text-xs font-bold">
                      {req.replies && req.replies.length > 0 ? 'پاسخ داده شده' : 'درخواست جدید'}
                    </span>
                  </div>
                  
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 bg-gray-50 p-4 rounded-xl">
                    <div>
                      <span className="text-xs text-gray-500 block mb-1">متراژ</span>
                      <span className="font-bold text-gray-800">{req.area} متر مربع</span>
                    </div>
                    <div>
                      <span className="text-xs text-gray-500 block mb-1">شهر</span>
                      <span className="font-bold text-gray-800">{req.city}</span>
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
                  
                  <div className="bg-amber-50 p-3 rounded-lg flex items-center gap-2 text-sm text-amber-700">
                    <CheckCircle size={16} className="text-amber-500 shrink-0" />
                    اطلاعات تماس کاربر مخفی است. پاسخ شما برای کاربر ارسال می‌شود و در صورت تایید، ارتباط مستقیم برقرار می‌گردد.
                  </div>

                  {req.replies && req.replies.length > 0 && (
                    <div className="border-t border-gray-100 pt-4 mt-2">
                      <h4 className="font-bold text-gray-700 text-sm mb-3">پاسخ‌های ثبت شده:</h4>
                      <div className="space-y-3">
                        {req.replies.map((reply: any, i: number) => (
                          <div key={i} className="bg-gray-50 p-4 rounded-xl border border-gray-100">
                            <div className="flex justify-between items-start mb-2">
                              <span className="font-bold text-sm text-gray-800">{reply.epcName}</span>
                              <span className="text-xs text-gray-400">{new Date(reply.createdAt).toLocaleDateString('fa-IR')}</span>
                            </div>
                            <p className="text-sm text-gray-600">{reply.message}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  <div className="mt-2">
                    <label className="block text-sm font-bold text-gray-700 mb-2">ثبت پیشنهاد جدید:</label>
                    <textarea 
                      className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-amber-500 focus:ring-2 focus:ring-amber-200 outline-none transition-all resize-none text-sm"
                      rows={3}
                      placeholder="پیام یا پیشنهاد خود را برای کاربر بنویسید..."
                      value={replyText[req.id] || ''}
                      onChange={(e) => setReplyText({...replyText, [req.id]: e.target.value})}
                    ></textarea>
                    <button 
                      onClick={() => handleReply(req.id)}
                      disabled={!replyText[req.id]}
                      className="mt-3 bg-amber-500 text-white px-6 py-2.5 rounded-xl font-bold text-sm hover:bg-amber-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      ارسال پاسخ به کاربر
                    </button>
                  </div>
                </div>
              ))
            )}
          </motion.div>
        )}

        
        {activeTab === 'settings' && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="bg-white rounded-3xl border border-gray-200 shadow-sm p-6 sm:p-8">
            <h2 className="text-2xl font-black text-gray-900 mb-6 flex items-center gap-2">
              <Settings className="text-amber-600" size={28} />
              ویرایش اطلاعات و بارگذاری مدارک
            </h2>
            <form className="space-y-6" onSubmit={(e) => { e.preventDefault(); alert('اطلاعات با موفقیت ذخیره شد'); }}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">نام شرکت / پیمانکار</label>
                  <input type="text" defaultValue="مهندسی نیروپژوهان" className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-amber-500 focus:ring-2 focus:ring-amber-200 outline-none transition-all" />
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">حوزه فعالیت</label>
                  <input type="text" defaultValue="نصب و راه‌اندازی نیروگاه‌های خورشیدی" className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-amber-500 focus:ring-2 focus:ring-amber-200 outline-none transition-all" />
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">شماره تماس</label>
                  <input type="text" defaultValue="021-88888888" className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-amber-500 focus:ring-2 focus:ring-amber-200 outline-none transition-all" />
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">آدرس دفتر مرکزی</label>
                  <input type="text" defaultValue="تهران، ونک" className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-amber-500 focus:ring-2 focus:ring-amber-200 outline-none transition-all" />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-bold text-gray-700 mb-2">درباره شرکت</label>
                  <textarea rows={3} defaultValue="شرکت نیروپژوهان با بیش از ده سال سابقه در طراحی و اجرای نیروگاه‌های خورشیدی مگاواتی." className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-amber-500 focus:ring-2 focus:ring-amber-200 outline-none transition-all resize-none"></textarea>
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-bold text-gray-700 mb-2">بارگذاری مدارک شرکت (اساسنامه، گواهی صلاحیت، رزومه)</label>
                  <div className="border-2 border-dashed border-gray-300 rounded-xl p-8 text-center hover:border-amber-500 transition-colors cursor-pointer bg-gray-50/50">
                    <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center mx-auto mb-4 shadow-sm">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-amber-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                      </svg>
                    </div>
                    <p className="text-sm font-bold text-gray-700 mb-1">فایل‌های خود را اینجا رها کنید یا کلیک کنید</p>
                    <p className="text-xs text-gray-500">PDF, JPG, PNG (حداکثر ۱۰ مگابایت)</p>
                  </div>
                </div>
              </div>
              <div className="pt-4 border-t border-gray-100 flex gap-4">
                <button type="submit" className="bg-amber-500 text-white px-8 py-3 rounded-xl font-bold hover:bg-amber-600 transition-colors text-sm">
                  ذخیره اطلاعات
                </button>
                <button type="button" onClick={() => setActiveTab('overview')} className="bg-gray-100 text-gray-700 px-8 py-3 rounded-xl font-bold hover:bg-gray-200 transition-colors text-sm">
                  بازگشت
                </button>
              </div>
            </form>
          </motion.div>
        )}
        
        {activeTab !== 'overview' && activeTab !== 'requests' && activeTab !== 'settings' && (

          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="bg-white p-8 rounded-2xl border border-gray-100 shadow-sm text-center py-20">
            <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6 text-gray-400">
              <Clock size={48} />
            </div>
            <h2 className="text-2xl font-bold text-gray-800 mb-2">این بخش در حال توسعه است</h2>
            <p className="text-gray-500 max-w-md mx-auto">
              بخش {activeTab} به زودی با امکانات کامل در دسترس شما قرار خواهد گرفت.
            </p>
            <button 
              onClick={() => setActiveTab('overview')}
              className="mt-8 bg-amber-500 text-white px-6 py-3 rounded-xl font-bold hover:bg-amber-600 transition-colors"
            >
              بازگشت به داشبورد
            </button>
          </motion.div>
        )}
      </div>

      {/* Mobile Navigation Bar */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 p-2 flex justify-around items-center z-50">
        <button onClick={() => setActiveTab('overview')} className={`p-3 rounded-xl flex flex-col items-center gap-1 ${activeTab === 'overview' ? 'text-amber-600' : 'text-gray-500'}`}>
          <TrendingUp size={24} />
          <span className="text-[10px] font-bold">داشبورد</span>
        </button>
        <button onClick={() => setActiveTab('projects')} className={`p-3 rounded-xl flex flex-col items-center gap-1 ${activeTab === 'projects' ? 'text-amber-600' : 'text-gray-500'}`}>
          <Briefcase size={24} />
          <span className="text-[10px] font-bold">پروژه‌ها</span>
        </button>
        <button onClick={() => setActiveTab('requests')} className={`p-3 rounded-xl flex flex-col items-center gap-1 relative ${activeTab === 'requests' ? 'text-amber-600' : 'text-gray-500'}`}>
          <FileText size={24} />
          <span className="absolute top-2 right-2 bg-red-500 text-white text-[8px] w-4 h-4 flex items-center justify-center rounded-full">۳</span>
          <span className="text-[10px] font-bold">درخواست</span>
        </button>
        <button onClick={() => setActiveTab('messages')} className={`p-3 rounded-xl flex flex-col items-center gap-1 ${activeTab === 'messages' ? 'text-amber-600' : 'text-gray-500'}`}>
          <MessageSquare size={24} />
          <span className="text-[10px] font-bold">پیام‌ها</span>
        </button>
      </div>
    </div>
  );
}
