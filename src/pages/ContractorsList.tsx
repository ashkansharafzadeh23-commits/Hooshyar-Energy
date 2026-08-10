import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Search, MapPin, Star, Building2, Phone, ArrowLeft, CheckCircle, ShieldCheck, Filter } from 'lucide-react';
import { Link } from 'react-router-dom';

const CONTRACTORS = [
  {
    id: '1',
    name: 'توسعه انرژی خورشیدی مهر',
    rating: 4.8,
    reviews: 124,
    city: 'تهران',
    projectsCompleted: 85,
    specialty: 'نیروگاه‌های خورشیدی مقیاس بزرگ و صنعتی',
    type: 'solar',
    verified: true,
  },
  {
    id: '2',
    name: 'شرکت مهندسی نیروپژوهان راد',
    rating: 4.6,
    reviews: 89,
    city: 'اصفهان',
    projectsCompleted: 62,
    specialty: 'نیروگاه‌های خانگی و سوله صنعتی',
    type: 'solar',
    verified: true,
  },
  {
    id: '3',
    name: 'آفتاب تابان کیش (EPC)',
    rating: 4.9,
    reviews: 210,
    city: 'سراسری',
    projectsCompleted: 140,
    specialty: 'طراحی، تامین تجهیزات و اجرای پروژه‌های مگاواتی',
    type: 'solar',
    verified: true,
  },
  {
    id: '4',
    name: 'نورآوران سبز یزد',
    rating: 4.5,
    reviews: 45,
    city: 'یزد',
    projectsCompleted: 38,
    specialty: 'احداث مزارع خورشیدی در مناطق خشک',
    type: 'solar',
    verified: false,
  },
  {
    id: '5',
    name: 'نیرومولد پاسارگاد',
    rating: 4.7,
    reviews: 156,
    city: 'تهران',
    projectsCompleted: 110,
    specialty: 'تامین و نصب دیزل ژنراتورهای صنعتی و اضطراری',
    type: 'generator',
    verified: true,
  },
  {
    id: '6',
    name: 'پارس ژنراتور نوین',
    rating: 4.2,
    reviews: 34,
    city: 'خراسان رضوی',
    projectsCompleted: 45,
    specialty: 'دیزل ژنراتور و موتور برق',
    type: 'generator',
    verified: false,
  },
  {
    id: '7',
    name: 'البرز توان پایا',
    rating: 4.8,
    reviews: 210,
    city: 'البرز',
    projectsCompleted: 130,
    specialty: 'نیروگاه‌های خورشیدی و موتوربرق‌های اضطراری',
    type: 'both',
    verified: true,
  }
];

export default function ContractorsList() {
  const [search, setSearch] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [minRating, setMinRating] = useState(0);

  const filteredContractors = CONTRACTORS.filter(c => 
    (c.name.includes(search) || c.city.includes(search)) &&
    (filterType === 'all' || c.type === filterType || c.type === 'both') &&
    (c.rating >= minRating)
  );

  return (
    <div className="flex flex-col items-center w-full pb-24 font-Vazirmatn">
      <div className="w-full bg-white rounded-3xl p-6 shadow-sm border border-gray-100 mb-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-2xl sm:text-3xl font-black text-gray-800 flex items-center gap-2">
              <Building2 className="text-blue-600" size={32} />
              شرکت‌های پیمانکار و مجری (EPC)
            </h1>
            <p className="text-gray-500 mt-2">لیست مجریان و پیمانکاران معتبر برای احداث نیروگاه و تامین تجهیزات</p>
          </div>
        </div>

        <div className="flex flex-col lg:flex-row gap-4 mb-8">
          <div className="relative flex-1">
            <input 
              type="text" 
              placeholder="جستجو نام شرکت یا استان..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full px-5 py-4 pr-12 rounded-2xl border border-gray-200 focus:border-blue-500 focus:ring-4 focus:ring-blue-100 outline-none transition-all font-medium text-gray-700 bg-gray-50"
            />
            <Search className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
          </div>

          <div className="flex gap-4 flex-wrap lg:flex-nowrap">
            <div className="flex-1 lg:w-48">
              <select 
                value={filterType}
                onChange={(e) => setFilterType(e.target.value)}
                className="w-full px-5 py-4 rounded-2xl border border-gray-200 focus:border-blue-500 focus:ring-4 focus:ring-blue-100 outline-none transition-all font-medium text-gray-700 bg-gray-50 appearance-none"
              >
                <option value="all">همه تخصص‌ها</option>
                <option value="solar">برق خورشیدی</option>
                <option value="generator">دیزل ژنراتور</option>
              </select>
            </div>
            <div className="flex-1 lg:w-48">
              <select 
                value={minRating}
                onChange={(e) => setMinRating(Number(e.target.value))}
                className="w-full px-5 py-4 rounded-2xl border border-gray-200 focus:border-blue-500 focus:ring-4 focus:ring-blue-100 outline-none transition-all font-medium text-gray-700 bg-gray-50 appearance-none"
              >
                <option value={0}>امتیاز: همه</option>
                <option value={4.0}>امتیاز: ۴.۰ به بالا</option>
                <option value={4.5}>امتیاز: ۴.۵ به بالا</option>
                <option value={4.8}>امتیاز: ۴.۸ به بالا</option>
              </select>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {filteredContractors.map((contractor, index) => (
            <motion.div 
              key={contractor.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="border border-gray-200 rounded-2xl p-6 hover:shadow-lg transition-shadow bg-white relative overflow-hidden group"
            >
              {contractor.verified && (
                <div className="absolute top-0 right-0 bg-blue-500 text-white text-[10px] font-bold px-3 py-1 rounded-bl-lg flex items-center gap-1 z-10">
                  <ShieldCheck size={14} />
                  شرکت تایید شده
                </div>
              )}
              
              <div className="flex justify-between items-start mb-4 mt-2">
                <div>
                  <h3 className="text-xl font-bold text-gray-800 mb-2">{contractor.name}</h3>
                  <div className="flex items-center gap-4 text-sm text-gray-500">
                    <span className="flex items-center gap-1 bg-gray-100 px-2 py-1 rounded-md">
                      <MapPin size={16} />
                      {contractor.city}
                    </span>
                    <span className="flex items-center gap-1 text-amber-500 font-bold bg-amber-50 px-2 py-1 rounded-md">
                      <Star size={16} className="fill-amber-500" />
                      {contractor.rating} ({contractor.reviews} نظر)
                    </span>
                  </div>
                </div>
              </div>

              <div className="bg-gray-50 p-4 rounded-xl mb-6">
                <div className="text-sm text-gray-600 mb-2">
                  <span className="font-bold text-gray-800">تخصص: </span>
                  {contractor.specialty}
                </div>
                <div className="text-sm text-gray-600 flex items-center gap-1">
                  <CheckCircle size={16} className="text-green-500" />
                  <span className="font-bold text-gray-800">پروژه‌های موفق: </span>
                  {contractor.projectsCompleted} پروژه
                </div>
              </div>

              <div className="flex gap-3">
                <button className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-xl transition-colors flex items-center justify-center gap-2">
                  <Phone size={18} />
                  تماس و مشاوره
                </button>
              </div>
            </motion.div>
          ))}

          {filteredContractors.length === 0 && (
            <div className="col-span-full py-12 text-center text-gray-500">
              شرکتی با این مشخصات یافت نشد.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
