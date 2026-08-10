import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Phone, Lock, Building2, MapPin, Upload, Briefcase, Award } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { AdBanner } from '../components/AdBanner';

export default function ContractorAuth() {
  const [isLogin, setIsLogin] = useState(true);
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    password: '',
    city: '',
    specialty: 'نیروگاه‌های خورشیدی مقیاس بزرگ و صنعتی',
    projectsCompleted: '',
    bio: ''
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    navigate('/contractor-dashboard');
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-[80vh] w-full font-Vazirmatn py-8 px-4">
      <div className="w-full max-w-2xl relative">
        <motion.div 
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          className="absolute -top-12 sm:-top-16 left-1/2 -translate-x-1/2 bg-amber-500 text-white w-24 h-24 sm:w-32 sm:h-32 rounded-full flex items-center justify-center shadow-xl border-4 border-[#F7F8FA] z-10"
        >
          <Building2 size={48} className="sm:w-16 sm:h-16" />
        </motion.div>
        
        <div className="bg-white rounded-[2rem] shadow-lg border border-gray-100 overflow-hidden pt-16 sm:pt-20">
          <div className="flex border-b border-gray-100">
            <button 
              onClick={() => setIsLogin(true)}
              className={`flex-1 py-4 font-bold text-lg relative transition-colors ${isLogin ? 'text-amber-600' : 'text-gray-400 hover:text-gray-600'}`}
            >
              ورود شرکت
              {isLogin && <motion.div layoutId="contractor_tab" className="absolute bottom-0 left-0 right-0 h-1 bg-amber-500 rounded-t-full" />}
            </button>
            <button 
              onClick={() => setIsLogin(false)}
              className={`flex-1 py-4 font-bold text-lg relative transition-colors ${!isLogin ? 'text-amber-600' : 'text-gray-400 hover:text-gray-600'}`}
            >
              ثبت شرکت
              {!isLogin && <motion.div layoutId="contractor_tab" className="absolute bottom-0 left-0 right-0 h-1 bg-amber-500 rounded-t-full" />}
            </button>
          </div>
          
          <div className="p-6 md:p-8">
            <form onSubmit={handleSubmit} className="space-y-6">
              {!isLogin && (
                <>
                  <div className="flex flex-col sm:flex-row items-center gap-6 pb-6 border-b border-gray-100">
                    <div className="w-20 h-20 bg-gray-50 border-2 border-dashed border-gray-300 rounded-full flex flex-col items-center justify-center text-gray-400 hover:text-amber-500 hover:border-amber-300 hover:bg-amber-50 transition-colors cursor-pointer group shrink-0">
                      <Upload size={20} className="mb-1 group-hover:scale-110 transition-transform" />
                      <span className="text-[9px] font-bold">لوگو شرکت</span>
                    </div>
                    <div className="text-center sm:text-right">
                      <h3 className="font-bold text-gray-800 mb-1">لوگوی شرکت</h3>
                      <p className="text-sm text-gray-500">ارسال لوگو، اعتبار شما را نزد کارفرمایان افزایش می‌دهد.</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-bold text-gray-700 mb-2">نام شرکت</label>
                      <input required name="name" value={formData.name} onChange={handleChange} type="text" className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-amber-500 focus:ring-2 focus:ring-amber-200 outline-none transition-all font-medium text-gray-800" placeholder="مثال: مهندسی نیروپژوهان" />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-bold text-gray-700 mb-2">تخصص اصلی</label>
                      <div className="relative">
                        <select required name="specialty" value={formData.specialty} onChange={handleChange} className="w-full px-4 py-3 pr-10 rounded-xl border border-gray-200 focus:border-amber-500 focus:ring-2 focus:ring-amber-200 outline-none transition-all font-medium text-gray-800 appearance-none bg-white">
                          <option value="نیروگاه‌های خورشیدی مقیاس بزرگ و صنعتی">نیروگاه‌های مقیاس بزرگ و صنعتی</option>
                          <option value="نیروگاه‌های خانگی و سوله صنعتی">نیروگاه‌های خانگی و سوله صنعتی</option>
                          <option value="طراحی، تامین تجهیزات و اجرای پروژه‌های مگاواتی">طراحی و اجرای پروژه‌های مگاواتی</option>
                          <option value="احداث مزارع خورشیدی در مناطق خشک">احداث مزارع خورشیدی</option>
                        </select>
                        <Briefcase className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" size={18} />
                      </div>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-bold text-gray-700 mb-2">تعداد پروژه‌های موفق</label>
                      <div className="relative">
                        <input required name="projectsCompleted" value={formData.projectsCompleted} onChange={handleChange} type="number" min="1" className="w-full px-4 py-3 pr-10 rounded-xl border border-gray-200 focus:border-amber-500 focus:ring-2 focus:ring-amber-200 outline-none transition-all font-medium text-gray-800" placeholder="مثال: 45" />
                        <Award className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" size={18} />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-bold text-gray-700 mb-2">شهر و استان فعالیت</label>
                      <div className="relative">
                        <input required name="city" value={formData.city} onChange={handleChange} type="text" className="w-full px-4 py-3 pr-10 rounded-xl border border-gray-200 focus:border-amber-500 focus:ring-2 focus:ring-amber-200 outline-none transition-all font-medium text-gray-800" placeholder="مثال: تهران / سراسری" />
                        <MapPin className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" size={18} />
                      </div>
                    </div>
                  </div>
                </>
              )}
              
              <div className="grid grid-cols-1 gap-6">
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">شماره موبایل یا تلفن شرکت</label>
                  <div className="relative">
                    <input required name="phone" value={formData.phone} onChange={handleChange} type="tel" dir="ltr" className="w-full px-4 py-3.5 pl-10 rounded-xl border border-gray-200 focus:border-amber-500 focus:ring-2 focus:ring-amber-200 outline-none transition-all font-medium text-gray-800 text-right" placeholder="0912... / 021..." />
                    <Phone className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" size={18} />
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">رمز عبور</label>
                  <div className="relative">
                    <input required name="password" value={formData.password} onChange={handleChange} type="password" dir="ltr" className="w-full px-4 py-3.5 pl-10 rounded-xl border border-gray-200 focus:border-amber-500 focus:ring-2 focus:ring-amber-200 outline-none transition-all font-medium text-gray-800 text-right" placeholder="********" />
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" size={18} />
                  </div>
                </div>
              </div>
              
              {!isLogin && (
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">توضیحات و رزومه شرکت</label>
                  <textarea name="bio" value={formData.bio} onChange={handleChange} rows={3} className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-amber-500 focus:ring-2 focus:ring-amber-200 outline-none transition-all font-medium text-gray-800 resize-none" placeholder="توضیحات مختصری درباره شرکت و توانمندی‌هایتان بنویسید..."></textarea>
                </div>
              )}

              <div className="pt-4">
                <button type="submit" className="w-full flex items-center justify-center gap-2 bg-amber-500 text-white py-4 rounded-xl text-lg font-bold hover:bg-amber-600 transition-colors shadow-md">
                  {isLogin ? 'ورود به پنل شرکت' : 'ثبت شرکت EPC'}
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
