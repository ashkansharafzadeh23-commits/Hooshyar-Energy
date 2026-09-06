import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, UserCircle, Phone, Lock, UserPlus, MapPin, Briefcase, Award, Upload } from 'lucide-react';
import { AdBanner } from '../components/AdBanner';

export default function TechnicianAuth() {
  const navigate = useNavigate();
  const [isLogin, setIsLogin] = useState(true);
  
  const [formData, setFormData] = useState({
    phone: '',
    password: '',
    name: '',
    profession: 'متخصص سیستم‌های خورشیدی',
    experience: '',
    fee: '',
    city: '',
    bio: ''
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (isLogin) {
      navigate('/technician-dashboard');
    } else {
      const newTech = {
        id: Date.now(),
        name: formData.name,
        profession: formData.profession,
        exp: `${formData.experience} سال تجربه`,
        city: formData.city,
        phone: formData.phone,
        fee: formData.fee,
        bio: formData.bio,
        photo: 'https://i.pravatar.cc/150?u=' + Date.now()
      };
      
      let existing = [];
      try {
        const raw = localStorage.getItem('registered_technicians');
        existing = raw ? JSON.parse(raw) : [];
      } catch (e) { console.error(e); }
      localStorage.setItem('registered_technicians', JSON.stringify([newTech, ...existing]));
      
      navigate('/technician-dashboard');
    }
  };

  return (
    <div className="min-h-screen bg-[#F7F8FA] font-Vazirmatn p-4 md:p-6 pb-24">
      <div className="max-w-2xl mx-auto space-y-6 pt-10">
        <header className="flex items-center justify-between mb-8">
          <Link to="/vendors" className="inline-flex items-center gap-2 text-[#5A6072] hover:text-[#1A1D23] font-medium transition-colors">
            <ArrowLeft size={18} />
            بازگشت
          </Link>
          <h1 className="text-xl sm:text-2xl font-black text-[#1A1D23] flex items-center gap-2">
            <UserCircle className="text-green-600" />
            کارشناسان و تعمیرکاران فنی
          </h1>
        </header>
        
        <div className="bg-white rounded-3xl shadow-sm border border-[#E4E7EC] overflow-hidden">
          {/* Tabs */}
          <div className="flex border-b border-gray-100">
            <button 
              onClick={() => setIsLogin(true)}
              className={`flex-1 py-4 font-bold text-center transition-colors relative ${isLogin ? 'text-green-600' : 'text-gray-500 hover:text-gray-700'}`}
            >
              ورود به حساب
              {isLogin && <motion.div layoutId="tech_tab" className="absolute bottom-0 left-0 right-0 h-1 bg-green-600 rounded-t-full" />}
            </button>
            <button 
              onClick={() => setIsLogin(false)}
              className={`flex-1 py-4 font-bold text-center transition-colors relative ${!isLogin ? 'text-green-600' : 'text-gray-500 hover:text-gray-700'}`}
            >
              ثبت‌نام کارشناس
              {!isLogin && <motion.div layoutId="tech_tab" className="absolute bottom-0 left-0 right-0 h-1 bg-green-600 rounded-t-full" />}
            </button>
          </div>
          
          <div className="p-6 md:p-8">
            <form onSubmit={handleSubmit} className="space-y-6">
              {!isLogin && (
                <>
                  <div className="flex flex-col sm:flex-row items-center gap-6 pb-6 border-b border-gray-100">
                    <div className="w-20 h-20 bg-gray-50 border-2 border-dashed border-gray-300 rounded-full flex flex-col items-center justify-center text-gray-400 hover:text-green-500 hover:border-green-300 hover:bg-green-50 transition-colors cursor-pointer group shrink-0">
                      <Upload size={20} className="mb-1 group-hover:scale-110 transition-transform" />
                      <span className="text-[9px] font-bold">آپلود عکس</span>
                    </div>
                    <div className="text-center sm:text-right">
                      <h3 className="font-bold text-gray-800 mb-1">تصویر پروفایل</h3>
                      <p className="text-sm text-gray-500">ارسال یک عکس حرفه‌ای، اعتماد مشتریان را افزایش می‌دهد.</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-bold text-gray-700 mb-2">نام و نام خانوادگی</label>
                      <input required name="name" value={formData.name} onChange={handleChange} type="text" className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-green-500 focus:ring-2 focus:ring-green-200 outline-none transition-all font-medium text-gray-800" placeholder="مثال: علی احمدی" />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-bold text-gray-700 mb-2">تخصص اصلی</label>
                      <div className="relative">
                        <select required name="profession" value={formData.profession} onChange={handleChange} className="w-full px-4 py-3 pr-10 rounded-xl border border-gray-200 focus:border-green-500 focus:ring-2 focus:ring-green-200 outline-none transition-all font-medium text-gray-800 appearance-none bg-white">
                          <option value="متخصص سیستم‌های خورشیدی">متخصص سیستم‌های خورشیدی</option>
                          <option value="تعمیرکار ژنراتور و موتور برق">تعمیرکار ژنراتور و موتور برق</option>
                          <option value="کارشناس باتری و یو‌پی‌اس">کارشناس باتری و یو‌پی‌اس</option>
                          <option value="برقکار ساختمان و صنعتی">برقکار ساختمان و صنعتی</option>
                        </select>
                        <Briefcase className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" size={18} />
                      </div>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-bold text-gray-700 mb-2">سابقه کار (سال)</label>
                      <div className="relative">
                        <input required name="experience" value={formData.experience} onChange={handleChange} type="number" min="1" max="50" className="w-full px-4 py-3 pr-10 rounded-xl border border-gray-200 focus:border-green-500 focus:ring-2 focus:ring-green-200 outline-none transition-all font-medium text-gray-800" placeholder="مثال: 5" />
                        <Award className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" size={18} />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-bold text-gray-700 mb-2">هزینه پایه کارشناسی (تومان)</label>
                      <div className="relative">
                        <input required name="fee" value={formData.fee} onChange={handleChange} type="number" dir="ltr" className="w-full px-4 py-3 pl-12 rounded-xl border border-gray-200 focus:border-green-500 focus:ring-2 focus:ring-green-200 outline-none transition-all font-medium text-gray-800 text-right" placeholder="500000" />
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none text-xs">تومان</span>
                      </div>
                    </div>
                    
                    <div className="md:col-span-2">
                      <label className="block text-sm font-bold text-gray-700 mb-2">شهر و استان فعالیت</label>
                      <div className="relative">
                        <input required name="city" value={formData.city} onChange={handleChange} type="text" className="w-full px-4 py-3 pr-10 rounded-xl border border-gray-200 focus:border-green-500 focus:ring-2 focus:ring-green-200 outline-none transition-all font-medium text-gray-800" placeholder="مثال: تهران" />
                        <MapPin className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" size={18} />
                      </div>
                    </div>
                  </div>
                </>
              )}
              
              <div className="grid grid-cols-1 gap-6">
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">شماره موبایل</label>
                  <div className="relative">
                    <input required name="phone" value={formData.phone} onChange={handleChange} type="tel" dir="ltr" className="w-full px-4 py-3.5 pl-10 rounded-xl border border-gray-200 focus:border-green-500 focus:ring-2 focus:ring-green-200 outline-none transition-all font-medium text-gray-800 text-right" placeholder="0912..." />
                    <Phone className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" size={18} />
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">رمز عبور</label>
                  <div className="relative">
                    <input required name="password" value={formData.password} onChange={handleChange} type="password" dir="ltr" className="w-full px-4 py-3.5 pl-10 rounded-xl border border-gray-200 focus:border-green-500 focus:ring-2 focus:ring-green-200 outline-none transition-all font-medium text-gray-800 text-right" placeholder="********" />
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" size={18} />
                  </div>
                </div>
              </div>
              
              {!isLogin && (
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">توضیحات و مهارت‌های ویژه</label>
                  <textarea name="bio" value={formData.bio} onChange={handleChange} rows={3} className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-green-500 focus:ring-2 focus:ring-green-200 outline-none transition-all font-medium text-gray-800 resize-none" placeholder="توضیحات مختصری درباره خود و توانمندی‌هایتان بنویسید..."></textarea>
                </div>
              )}

              <div className="pt-4">
                <button type="submit" className="w-full flex items-center justify-center gap-2 bg-green-600 text-white py-4 rounded-xl text-lg font-bold hover:bg-green-700 transition-colors shadow-md">
                  {isLogin ? 'ورود به پنل کارشناسی' : 'ثبت‌نام کارشناس'}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
      <div className="mt-8"><AdBanner layout="card" /></div>
    </div>
  );
}
