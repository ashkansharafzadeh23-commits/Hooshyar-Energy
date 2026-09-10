import React from 'react';
import { Link } from 'react-router-dom';
import { MapPin, DollarSign, Zap, Briefcase, Search, LayoutDashboard } from 'lucide-react';

export default function InvestmentHub() {
  return (
    <div className="max-w-6xl mx-auto py-12 px-4 sm:px-6 lg:px-8 font-Vazirmatn">
      
      <div className="text-center mb-16">
        <h1 className="text-4xl font-black text-gray-900 mb-4">مرکز فرصت‌های مشارکت و سرمایه‌گذاری انرژی</h1>
        <p className="text-xl text-gray-600 max-w-3xl mx-auto">
          زیرساخت دیجیتال برای کشف، بررسی و هم‌افزایی در پروژه‌های انرژی تجدیدپذیر
        </p>
      </div>

      <div className="bg-blue-50 border border-blue-100 rounded-2xl p-6 mb-12 text-center">
        <h2 className="text-xl font-bold text-blue-900 mb-6">چه چیزی در اختیار دارید؟</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <Link to="/investment-hub/create?type=land" className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 hover:border-blue-500 hover:shadow-md transition-all group text-right">
            <MapPin className="text-emerald-500 mb-4 group-hover:scale-110 transition-transform" size={32} />
            <h3 className="font-bold text-gray-900 mb-2">زمین دارم</h3>
            <p className="text-sm text-gray-500">مایلم زمین خود را برای احداث نیروگاه خورشیدی در اختیار سرمایه‌گذار قرار دهم.</p>
          </Link>
          
          <Link to="/investment-hub/investor-profile" className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 hover:border-blue-500 hover:shadow-md transition-all group text-right">
            <DollarSign className="text-blue-500 mb-4 group-hover:scale-110 transition-transform" size={32} />
            <h3 className="font-bold text-gray-900 mb-2">سرمایه دارم</h3>
            <p className="text-sm text-gray-500">به دنبال فرصت‌های سرمایه‌گذاری و مشارکت در پروژه‌های انرژی هستم.</p>
          </Link>
          
          <Link to="/investment-hub/create?type=project" className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 hover:border-blue-500 hover:shadow-md transition-all group text-right">
            <Zap className="text-amber-500 mb-4 group-hover:scale-110 transition-transform" size={32} />
            <h3 className="font-bold text-gray-900 mb-2">پروژه دارم</h3>
            <p className="text-sm text-gray-500">پروژه تعریف شده است و نیاز به تامین مالی یا شریک تجاری دارم.</p>
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
        <div className="bg-white rounded-2xl p-8 border border-gray-200 shadow-sm flex flex-col justify-between">
          <div>
            <div className="w-12 h-12 bg-indigo-50 rounded-lg flex items-center justify-center mb-6">
              <Search className="text-indigo-600" size={24} />
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-3">بازار فرصت‌ها (Marketplace)</h3>
            <p className="text-gray-600 leading-relaxed mb-6">
              مرور و جستجوی پیشرفته در میان پروژه‌های نیازمند سرمایه، زمین‌های آماده احداث و فرصت‌های مشارکت با قابلیت فیلتر بر اساس استان، ظرفیت و میزان سرمایه.
            </p>
          </div>
          <Link to="/investment-hub/opportunities" className="inline-flex items-center justify-center gap-2 bg-indigo-600 text-white px-6 py-3 rounded-xl font-bold hover:bg-indigo-700 transition-colors w-full sm:w-auto">
            مشاهده فرصت‌ها
          </Link>
        </div>

        <div className="bg-white rounded-2xl p-8 border border-gray-200 shadow-sm flex flex-col justify-between">
          <div>
            <div className="w-12 h-12 bg-fuchsia-50 rounded-lg flex items-center justify-center mb-6">
              <Briefcase className="text-fuchsia-600" size={24} />
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-3">داشبورد سرمایه‌گذاری من</h3>
            <p className="text-gray-600 leading-relaxed mb-6">
              مدیریت پروفایل سرمایه‌گذاری، مشاهده پیشنهادهای هوشمند سیستم (Matching Engine) بر اساس ترجیحات شما و پیگیری درخواست‌های آشنایی.
            </p>
          </div>
          <Link to="/investment-hub/matches" className="inline-flex items-center justify-center gap-2 bg-fuchsia-600 text-white px-6 py-3 rounded-xl font-bold hover:bg-fuchsia-700 transition-colors w-full sm:w-auto">
            <LayoutDashboard size={20} />
            داشبورد تطابق
          </Link>
        </div>
      </div>

      {/* Disclaimer */}
      <div className="text-sm text-gray-500 bg-gray-50 p-6 rounded-xl border border-gray-200 text-justify leading-relaxed">
        <strong>سلب مسئولیت:</strong> پلتفرم هوشیار انرژی صرفاً یک زیرساخت کشف و معرفی فرصت‌های پروژه است. ما هیچ‌گونه بازگشت سرمایه‌ای را تضمین نمی‌کنیم، پولی از سرمایه‌گذاران دریافت نمی‌کنیم و هیچ‌گونه اوراق بهادار یا سهامی را عرضه نمی‌کنیم. تمامی ارزیابی‌های فنی و مالی بر اساس اطلاعات وارد شده توسط کاربران است و هرگونه توافق تجاری مستلزم بررسی‌های مستقل حقوقی، مالی و فنی (Due Diligence) توسط طرفین خواهد بود.
      </div>

    </div>
  );
}
