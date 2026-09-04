import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  UserCircle, Wallet, Calendar, Star, CheckCircle, Clock, MapPin, 
  Phone, ArrowLeft, LogOut, Activity, Briefcase
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { AdBanner } from '../../components/AdBanner';

const mockRequests = [
  { id: 1, customer: 'شرکت آریان مهر', type: 'نصب پنل خورشیدی ۱۰ کیلووات', date: '۱۴۰۳/۰۸/۱۵', time: '۰۹:۰۰ صبح', address: 'تهران، شهرک صنعتی شمس آباد', status: 'pending', price: 'توافقی' },
  { id: 2, customer: 'آقای رضایی', type: 'تعمیر و سرویس موتور برق دیزلی', date: '۱۴۰۳/۰۸/۱۶', time: '۱۴:۳۰', address: 'کرج، مهرشهر', status: 'accepted', price: '۱,۵۰۰,۰۰۰ تومان' },
  { id: 3, customer: 'مجتمع مسکونی گلستان', type: 'تعویض باتری‌های یو‌پی‌اس', date: '۱۴۰۳/۰۸/۱۸', time: '۱۰:۰۰ صبح', address: 'تهران، نیاوران', status: 'completed', price: '۳,۲۰۰,۰۰۰ تومان' },
];

export default function TechnicianDashboard() {
  const [activeTab, setActiveTab] = useState('requests');

  return (
    <div className="min-h-screen bg-[#F7F8FA] font-Vazirmatn pb-24">
      {/* Header */}
      <header className="bg-green-600 text-white sticky top-0 z-40 shadow-md">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-sm">
              <UserCircle size={24} />
            </div>
            <div>
              <h1 className="font-bold text-sm sm:text-base">پنل کارشناسان و تعمیرکاران</h1>
              <p className="text-[10px] sm:text-xs text-green-100 font-medium">خوش آمدید، مهندس احمدی</p>
            </div>
          </div>
          <Link to="/" className="text-white/80 hover:text-white flex items-center gap-1 text-sm font-medium transition-colors">
            خروج
            <LogOut size={18} />
          </Link>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 sm:px-6 py-8 space-y-8">
        
        {/* Stats Summary */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-white p-5 rounded-3xl border border-gray-200 shadow-sm flex flex-col gap-2">
            <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
              <Wallet size={20} />
            </div>
            <div className="text-xs text-gray-500 font-bold mt-2">درآمد این ماه</div>
            <div className="text-lg sm:text-xl font-black text-gray-900">۱۲,۵۰۰,۰۰۰ <span className="text-xs font-normal text-gray-500">تومان</span></div>
          </div>
          
          <div className="bg-white p-5 rounded-3xl border border-gray-200 shadow-sm flex flex-col gap-2">
            <div className="w-10 h-10 rounded-xl bg-orange-50 text-orange-600 flex items-center justify-center">
              <Clock size={20} />
            </div>
            <div className="text-xs text-gray-500 font-bold mt-2">درخواست‌های فعال</div>
            <div className="text-lg sm:text-xl font-black text-gray-900">۳ <span className="text-xs font-normal text-gray-500">مورد</span></div>
          </div>

          <div className="bg-white p-5 rounded-3xl border border-gray-200 shadow-sm flex flex-col gap-2">
            <div className="w-10 h-10 rounded-xl bg-green-50 text-green-600 flex items-center justify-center">
              <CheckCircle size={20} />
            </div>
            <div className="text-xs text-gray-500 font-bold mt-2">کارهای انجام شده</div>
            <div className="text-lg sm:text-xl font-black text-gray-900">۴۸ <span className="text-xs font-normal text-gray-500">مورد</span></div>
          </div>

          <div className="bg-white p-5 rounded-3xl border border-gray-200 shadow-sm flex flex-col gap-2">
            <div className="w-10 h-10 rounded-xl bg-yellow-50 text-yellow-600 flex items-center justify-center">
              <Star size={20} />
            </div>
            <div className="text-xs text-gray-500 font-bold mt-2">امتیاز مشتریان</div>
            <div className="text-lg sm:text-xl font-black text-gray-900">۴.۸ <span className="text-xs font-normal text-gray-500">از ۵</span></div>
          </div>
        </div>

        {/* Main Content Area */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          
          {activeTab === 'profile' && (
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="bg-white rounded-3xl border border-gray-200 shadow-sm p-6 sm:p-8">
              <h2 className="text-2xl font-black text-gray-900 mb-6 flex items-center gap-2">
                <UserCircle className="text-green-600" size={28} />
                ویرایش اطلاعات و بارگذاری مدارک
              </h2>
              <form className="space-y-6" onSubmit={(e) => { e.preventDefault(); alert('اطلاعات با موفقیت ذخیره شد'); }}>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">نام و نام خانوادگی</label>
                    <input type="text" defaultValue="مهندس احمدی" className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-green-500 focus:ring-2 focus:ring-green-200 outline-none transition-all" />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">تخصص اصلی</label>
                    <input type="text" defaultValue="متخصص سیستم‌های خورشیدی" className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-green-500 focus:ring-2 focus:ring-green-200 outline-none transition-all" />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">شماره تماس</label>
                    <input type="text" defaultValue="09123456789" className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-green-500 focus:ring-2 focus:ring-green-200 outline-none transition-all" />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">شهر و منطقه فعالیت</label>
                    <input type="text" defaultValue="تهران، البرز" className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-green-500 focus:ring-2 focus:ring-green-200 outline-none transition-all" />
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-sm font-bold text-gray-700 mb-2">درباره من (بیوگرافی)</label>
                    <textarea rows={3} defaultValue="متخصص در راه‌اندازی و اورهال سیستم‌های آف‌گرید با ۱۰ سال سابقه فعالیت در پروژه‌های صنعتی." className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-green-500 focus:ring-2 focus:ring-green-200 outline-none transition-all resize-none"></textarea>
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-sm font-bold text-gray-700 mb-2">بارگذاری مدارک جدید (رزومه، گواهینامه، نمونه کار)</label>
                    <div className="border-2 border-dashed border-gray-300 rounded-xl p-8 text-center hover:border-green-500 transition-colors cursor-pointer bg-gray-50/50">
                      <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center mx-auto mb-4 shadow-sm">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                        </svg>
                      </div>
                      <p className="text-sm font-bold text-gray-700 mb-1">فایل‌های خود را اینجا رها کنید یا کلیک کنید</p>
                      <p className="text-xs text-gray-500">PDF, JPG, PNG (حداکثر ۵ مگابایت)</p>
                    </div>
                  </div>
                </div>
                <div className="pt-4 border-t border-gray-100 flex gap-4">
                  <button type="submit" className="bg-green-600 text-white px-8 py-3 rounded-xl font-bold hover:bg-green-700 transition-colors text-sm">
                    ذخیره تغییرات
                  </button>
                  <button type="button" onClick={() => setActiveTab('requests')} className="bg-gray-100 text-gray-700 px-8 py-3 rounded-xl font-bold hover:bg-gray-200 transition-colors text-sm">
                    انصراف
                  </button>
                </div>
              </form>
            </motion.div>
          )}
          
          {activeTab !== 'profile' && (<div className="lg:col-span-2 space-y-6">
            <div className="bg-white rounded-3xl border border-gray-200 shadow-sm overflow-hidden">
              <div className="p-5 border-b border-gray-100 flex items-center gap-4">
                <button 
                  onClick={() => setActiveTab('requests')}
                  className={`pb-2 px-1 border-b-2 font-bold text-sm transition-colors ${activeTab === 'requests' ? 'border-green-600 text-green-700' : 'border-transparent text-gray-500 hover:text-gray-800'}`}
                >
                  درخواست‌های جدید و فعال
                </button>
                <button 
                  onClick={() => setActiveTab('history')}
                  className={`pb-2 px-1 border-b-2 font-bold text-sm transition-colors ${activeTab === 'history' ? 'border-green-600 text-green-700' : 'border-transparent text-gray-500 hover:text-gray-800'}`}
                >
                  تاریخچه کارها
                </button>
              </div>
              
              <div className="p-5 flex flex-col gap-4">
                {mockRequests.filter(r => activeTab === 'requests' ? r.status !== 'completed' : r.status === 'completed').map(request => (
                  <motion.div 
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    key={request.id} 
                    className="border border-gray-100 rounded-2xl p-4 sm:p-5 hover:border-green-300 transition-colors bg-gray-50/50"
                  >
                    <div className="flex flex-col sm:flex-row justify-between gap-4 mb-4">
                      <div>
                        <div className="flex items-center gap-2 mb-2">
                          {request.status === 'pending' && <span className="bg-orange-100 text-orange-700 px-2.5 py-1 rounded-lg text-[10px] font-bold flex items-center gap-1"><Clock size={12}/> در انتظار تایید</span>}
                          {request.status === 'accepted' && <span className="bg-blue-100 text-blue-700 px-2.5 py-1 rounded-lg text-[10px] font-bold flex items-center gap-1"><Activity size={12}/> در حال انجام</span>}
                          {request.status === 'completed' && <span className="bg-green-100 text-green-700 px-2.5 py-1 rounded-lg text-[10px] font-bold flex items-center gap-1"><CheckCircle size={12}/> پایان یافته</span>}
                        </div>
                        <h3 className="font-black text-gray-900 text-lg mb-1">{request.type}</h3>
                        <p className="text-sm font-bold text-gray-600 flex items-center gap-1">
                          <UserCircle size={16} /> {request.customer}
                        </p>
                      </div>
                      <div className="text-right flex flex-col sm:items-end justify-center">
                        <div className="text-xl font-black text-green-700">{request.price}</div>
                        <div className="text-xs text-gray-500 mt-1">برآورد هزینه</div>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 bg-white p-4 rounded-xl border border-gray-100 mb-4">
                      <div className="flex items-center gap-2 text-sm text-gray-700">
                        <Calendar size={16} className="text-gray-400" />
                        <span className="font-medium">تاریخ: {request.date} - {request.time}</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-gray-700">
                        <MapPin size={16} className="text-gray-400 shrink-0" />
                        <span className="font-medium truncate">{request.address}</span>
                      </div>
                    </div>
                    
                    {activeTab === 'requests' && (
                      <div className="flex items-center gap-3">
                        {request.status === 'pending' && (
                          <>
                            <button className="flex-1 bg-green-600 text-white font-bold py-2.5 rounded-xl hover:bg-green-700 transition-colors text-sm">
                              قبول درخواست
                            </button>
                            <button className="flex-1 bg-red-50 text-red-600 font-bold py-2.5 rounded-xl hover:bg-red-100 transition-colors text-sm">
                              رد درخواست
                            </button>
                          </>
                        )}
                        {request.status === 'accepted' && (
                          <>
                            <button className="flex-1 bg-gray-900 text-white font-bold py-2.5 rounded-xl hover:bg-gray-800 transition-colors text-sm flex items-center justify-center gap-2">
                              <MapPin size={16} />
                              مسیریابی به محل
                            </button>
                            <button className="flex-1 bg-blue-50 text-blue-600 font-bold py-2.5 rounded-xl hover:bg-blue-100 transition-colors text-sm flex items-center justify-center gap-2">
                              <Phone size={16} />
                              تماس با مشتری
                            </button>
                          </>
                        )}
                      </div>
                    )}
                  </motion.div>
                ))}
                
                {mockRequests.filter(r => activeTab === 'requests' ? r.status !== 'completed' : r.status === 'completed').length === 0 && (
                  <div className="text-center py-12">
                    <Briefcase size={48} className="mx-auto text-gray-300 mb-4" />
                    <h3 className="text-lg font-bold text-gray-700 mb-1">موردی یافت نشد</h3>
                    <p className="text-sm text-gray-500">در حال حاضر در این بخش موردی وجود ندارد.</p>
                  </div>
                )}
              </div>
            </div>
          </div>
          )}
          
          <div className="space-y-6">
            <div className="bg-white rounded-3xl border border-gray-200 shadow-sm p-6 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-green-50 rounded-bl-full -z-0"></div>
              <div className="relative z-10">
                <h3 className="font-black text-gray-900 text-lg mb-4 flex items-center gap-2">
                  <Activity className="text-green-600" />
                  وضعیت فعالیت شما
                </h3>
                
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-bold text-gray-700">دریافت درخواست جدید</span>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input type="checkbox" className="sr-only peer" defaultChecked />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:right-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-green-600"></div>
                  </label>
                </div>
                <p className="text-xs text-gray-500 mb-6 leading-relaxed">
                  با روشن بودن این گزینه، مشتریان می‌توانند برای شما درخواست بازدید ارسال کنند.
                </p>
                
                <div className="space-y-4 pt-4 border-t border-gray-100">
                  <button onClick={() => setActiveTab('profile')} className="w-full text-right flex items-center justify-between group">
                    <span className="text-sm font-bold text-gray-700 group-hover:text-green-600 transition-colors">ویرایش پروفایل و تخصص‌ها</span>
                    <ArrowLeft size={16} className="text-gray-400 group-hover:text-green-600 transition-colors" />
                  </button>
                  <button onClick={() => setActiveTab('profile')} className="w-full text-right flex items-center justify-between group">
                    <span className="text-sm font-bold text-gray-700 group-hover:text-green-600 transition-colors">تنظیم ساعات کاری</span>
                    <ArrowLeft size={16} className="text-gray-400 group-hover:text-green-600 transition-colors" />
                  </button>
                  <button onClick={() => setActiveTab('profile')} className="w-full text-right flex items-center justify-between group">
                    <span className="text-sm font-bold text-gray-700 group-hover:text-green-600 transition-colors">کیف پول و تسویه حساب</span>
                    <ArrowLeft size={16} className="text-gray-400 group-hover:text-green-600 transition-colors" />
                  </button>
                </div>
              </div>
            </div>
            <div className="mt-6">
              <AdBanner layout="sidebar" />
            </div>
          </div>
          
        </div>
      </main>
    </div>
  );
}
