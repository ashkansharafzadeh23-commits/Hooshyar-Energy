import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, UserCircle, MapPin, Phone, Award, ShieldCheck, Briefcase } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { AdBanner } from '../components/AdBanner';

export default function TechniciansList() {
  const navigate = useNavigate();
  const [experts, setExperts] = useState([
    { id: 1, name: 'مهندس احمدی', profession: 'متخصص سیستم‌های خورشیدی', exp: '۱۰ سال تجربه', city: 'تهران', phone: '09123456789', fee: '500000', bio: 'متخصص در راه‌اندازی و اورهال سیستم‌های آف‌گرید', photo: 'https://i.pravatar.cc/150?u=1' },
    { id: 2, name: 'علی رضایی', profession: 'تعمیرکار ژنراتور و موتور برق', exp: '۱۵ سال تجربه', city: 'کرج', phone: '09129876543', fee: '450000', bio: 'تعمیرات تخصصی انواع موتورهای دیزلی و بنزینی', photo: 'https://i.pravatar.cc/150?u=2' },
    { id: 3, name: 'سارا محمدی', profession: 'کارشناس باتری و یو‌پی‌اس', exp: '۸ سال تجربه', city: 'اصفهان', phone: '09131112233', fee: '300000', bio: 'مشاوره و عیب‌یابی انواع باتری‌های لید اسید و لیتیومی', photo: 'https://i.pravatar.cc/150?u=3' }
  ]);

  useEffect(() => {
    const localTechs = JSON.parse(localStorage.getItem('registered_technicians') || '[]');
    if (localTechs.length > 0) {
      setExperts(prev => [...localTechs, ...prev]);
    }
  }, []);

  return (
    <div className="min-h-screen bg-[#F7F8FA] font-Vazirmatn p-4 md:p-6 pb-24">
      <div className="max-w-5xl mx-auto space-y-6">
        <AdBanner layout="banner" />
        <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div>
            
            <h1 className="text-2xl sm:text-3xl font-black text-[#1A1D23] flex items-center gap-3">
              <div className="p-2 bg-green-100 rounded-xl text-green-600">
                <UserCircle size={24} />
              </div>
              لیست کارشناسان و تعمیرکاران
            </h1>
          </div>
          <Link to="/technician-auth" className="bg-green-600 text-white font-bold py-2.5 px-5 rounded-xl hover:bg-green-700 transition-colors flex items-center justify-center gap-2 shadow-sm">
             ثبت‌نام به عنوان کارشناس
          </Link>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {experts.map(expert => (
            <motion.div 
              key={expert.id} 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white border border-gray-200 rounded-3xl p-6 flex flex-col hover:shadow-lg transition-all group"
            >
              <div className="flex items-start gap-4 mb-4">
                <img src={expert.photo} alt={expert.name} className="w-16 h-16 rounded-2xl object-cover border-2 border-gray-100" />
                <div className="flex-1">
                  <h3 className="font-bold text-gray-800 text-lg mb-1">{expert.name}</h3>
                  <p className="text-xs text-green-600 font-bold bg-green-50 px-2.5 py-1 rounded-lg inline-block mb-2">{expert.profession}</p>
                </div>
              </div>
              
              <div className="space-y-3 flex-1 mb-6">
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <ShieldCheck size={16} className="text-gray-400" />
                  <span>{expert.exp}</span>
                </div>
                {expert.city && (
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <MapPin size={16} className="text-gray-400" />
                    <span>{expert.city}</span>
                  </div>
                )}
                {expert.fee && (
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Briefcase size={16} className="text-gray-400" />
                    <span>هزینه کارشناسی: <strong>{Number(expert.fee).toLocaleString()} تومان</strong></span>
                  </div>
                )}
                {expert.bio && (
                  <p className="text-xs text-gray-500 leading-relaxed bg-gray-50 p-3 rounded-xl mt-3 line-clamp-2">
                    {expert.bio}
                  </p>
                )}
              </div>
              
              <div className="pt-4 border-t border-gray-100 flex items-center justify-between gap-3 mt-auto">
                {expert.phone && (
                   <a href={`tel:${expert.phone}`} className="flex-1 bg-gray-900 text-white py-2.5 rounded-xl text-sm font-bold hover:bg-gray-800 transition-colors flex items-center justify-center gap-2">
                     <Phone size={16} />
                     تماس مستقیم
                   </a>
                )}
                <button className="flex-1 bg-green-50 text-green-600 py-2.5 rounded-xl text-sm font-bold hover:bg-green-100 transition-colors">
                  درخواست بازدید
                </button>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}
