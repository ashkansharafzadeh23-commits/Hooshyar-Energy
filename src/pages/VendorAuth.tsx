import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, Store, Phone, Lock, Building, MapPin, UserCircle } from 'lucide-react';
import { AdBanner } from '../components/AdBanner';

export default function VendorAuth() {
  const navigate = useNavigate();
  const [isLogin, setIsLogin] = useState(true);
  
  const [formData, setFormData] = useState({
    phone: '',
    password: '',
    companyName: '',
    managerName: '',
    city: ''
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (isLogin) {
      // Direct to vendor portal
      navigate('/vendor-portal/dashboard');
    } else {
      // Mock register success and login
      navigate('/vendor-portal/dashboard');
    }
  };

  return (
    <div className="min-h-screen bg-[#F7F8FA] font-Vazirmatn p-4 md:p-6 pb-24">
      <div className="max-w-md mx-auto space-y-6 pt-10">
        <header className="flex items-center justify-between mb-8">
          <Link to="/vendors" className="inline-flex items-center gap-2 text-[#5A6072] hover:text-[#1A1D23] font-medium transition-colors">
            <ArrowLeft size={18} />
            بازگشت
          </Link>
          <h1 className="text-xl sm:text-2xl font-black text-[#1A1D23] flex items-center gap-2">
            <Store className="text-blue-600" />
            فروشندگان و تامین‌کنندگان
          </h1>
        </header>
        
        <div className="bg-white rounded-3xl shadow-sm border border-[#E4E7EC] overflow-hidden">
          {/* Tabs */}
          <div className="flex border-b border-gray-100">
            <button 
              onClick={() => setIsLogin(true)}
              className={`flex-1 py-4 font-bold text-center transition-colors relative ${isLogin ? 'text-blue-600' : 'text-gray-500 hover:text-gray-700'}`}
            >
              ورود به حساب
              {isLogin && <motion.div layoutId="vendor_tab" className="absolute bottom-0 left-0 right-0 h-1 bg-blue-600 rounded-t-full" />}
            </button>
            <button 
              onClick={() => setIsLogin(false)}
              className={`flex-1 py-4 font-bold text-center transition-colors relative ${!isLogin ? 'text-blue-600' : 'text-gray-500 hover:text-gray-700'}`}
            >
              ثبت‌نام شرکت
              {!isLogin && <motion.div layoutId="vendor_tab" className="absolute bottom-0 left-0 right-0 h-1 bg-blue-600 rounded-t-full" />}
            </button>
          </div>
          
          <div className="p-6 md:p-8">
            <form onSubmit={handleSubmit} className="space-y-5">
              {!isLogin && (
                <>
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">نام شرکت یا فروشگاه</label>
                    <div className="relative">
                      <input required name="companyName" value={formData.companyName} onChange={handleChange} type="text" className="w-full px-4 py-3.5 pr-10 rounded-xl border border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition-all font-medium text-gray-800" placeholder="مثال: نیرو گستران" />
                      <Building className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" size={18} />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">نام مدیریت</label>
                    <div className="relative">
                      <input required name="managerName" value={formData.managerName} onChange={handleChange} type="text" className="w-full px-4 py-3.5 pr-10 rounded-xl border border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition-all font-medium text-gray-800" placeholder="مثال: علی احمدی" />
                      <UserCircle className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" size={18} />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">شهر فعالیت</label>
                    <div className="relative">
                      <input required name="city" value={formData.city} onChange={handleChange} type="text" className="w-full px-4 py-3.5 pr-10 rounded-xl border border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition-all font-medium text-gray-800" placeholder="مثال: تهران" />
                      <MapPin className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" size={18} />
                    </div>
                  </div>
                </>
              )}
              
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">شماره موبایل</label>
                <div className="relative">
                  <input required name="phone" value={formData.phone} onChange={handleChange} type="tel" dir="ltr" className="w-full px-4 py-3.5 pl-10 rounded-xl border border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition-all font-medium text-gray-800 text-right" placeholder="0912..." />
                  <Phone className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" size={18} />
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">رمز عبور</label>
                <div className="relative">
                  <input required name="password" value={formData.password} onChange={handleChange} type="password" dir="ltr" className="w-full px-4 py-3.5 pl-10 rounded-xl border border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition-all font-medium text-gray-800 text-right" placeholder="********" />
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" size={18} />
                </div>
              </div>

              <div className="pt-4">
                <button type="submit" className="w-full flex items-center justify-center gap-2 bg-blue-600 text-white py-4 rounded-xl text-lg font-bold hover:bg-blue-700 transition-colors shadow-md">
                  {isLogin ? 'ورود به داشبورد' : 'ثبت‌نام و ایجاد فروشگاه'}
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
