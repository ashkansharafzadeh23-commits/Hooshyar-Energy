import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from "react-router-dom";
import { AdBanner } from "../components/AdBanner";
import { ArrowLeft, Settings,  Wrench, ShieldCheck, Search, Battery, Sun, Zap, Camera, Upload, Loader2, Image as ImageIcon, X } from 'lucide-react';
import Markdown from 'react-markdown';

export default function SmartMaintenance() {
  const navigate = useNavigate();
  const [generation, setGeneration] = useState(5000);
  const [consumption, setConsumption] = useState(4500);

  const balance = generation - consumption;
  const status = balance > 0 ? 'good' : balance < 0 ? 'warning' : 'neutral';

  
  const [images, setImages] = useState<{data: string, mimeType: string, previewUrl: string}[]>([]);
  const [problemDescription, setProblemDescription] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [aiAnalysisResult, setAiAnalysisResult] = useState<string | null>(null);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const newImages = Array.from(e.target.files);
      
      newImages.forEach(file => {
        const reader = new FileReader();
        reader.onloadend = () => {
          const result = reader.result as string;
          // split "data:image/jpeg;base64,....."
          const base64Data = result.split(',')[1];
          setImages(prev => [...prev, {
            data: base64Data,
            mimeType: file.type,
            previewUrl: result
          }]);
        };
        reader.readAsDataURL(file);
      });
    }
  };

  const removeImage = (index: number) => {
    setImages(prev => prev.filter((_, i) => i !== index));
  };

  const handleAnalyze = async () => {
    if (images.length === 0 && !problemDescription) return;
    
    setIsAnalyzing(true);
    try {
      const res = await fetch('/api/analyze-maintenance', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          images: images,
          textContext: problemDescription
        })
      });
      
      const data = await res.json();
      if (data.analysis) {
        setAiAnalysisResult(data.analysis);
      }
    } catch (error) {
      console.error(error);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const [experts, setExperts] = useState([
    { id: 1, name: 'مهندس احمدی', profession: 'متخصص سیستم‌های خورشیدی', exp: '۱۰ سال تجربه', photo: 'https://i.pravatar.cc/150?u=1' },
    { id: 2, name: 'علی رضایی', profession: 'تعمیرکار ژنراتور و موتور برق', exp: '۱۵ سال تجربه', photo: 'https://i.pravatar.cc/150?u=2' },
    { id: 3, name: 'سارا محمدی', profession: 'کارشناس باتری و یو‌پی‌اس', exp: '۸ سال تجربه', photo: 'https://i.pravatar.cc/150?u=3' }
  ]);

  useEffect(() => {
    const localTechs = JSON.parse(localStorage.getItem('registered_technicians') || '[]');
    if (localTechs.length > 0) {
      setExperts(prev => [...localTechs, ...prev]);
    }
  }, []);

  return (
    <div className="min-h-screen bg-[#F7F8FA] font-Vazirmatn p-4 md:p-6 pb-24">
      <div className="max-w-4xl mx-auto space-y-6">
        <AdBanner />
        <header className="flex items-center justify-between">
          
          <h1 className="text-2xl sm:text-3xl font-black text-[#1A1D23] flex items-center gap-2">
            <Settings className="text-blue-600" />
            تعمیرات و نگهداری هوشمند
          </h1>
        </header>

        <div className="bg-white p-6 rounded-2xl shadow-sm border border-[#E4E7EC]">
          <h2 className="text-xl font-bold mb-4">ماشین‌حساب توازن انرژی</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">توان تولیدی (وات)</label>
              <div className="relative">
                <input type="number" value={generation} onChange={e => setGeneration(Number(e.target.value))} className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition-all pr-10" />
                <Zap className="absolute right-3 top-3.5 text-gray-400" size={18} />
              </div>
            </div>
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">توان مصرفی (وات)</label>
              <div className="relative">
                <input type="number" value={consumption} onChange={e => setConsumption(Number(e.target.value))} className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition-all pr-10" />
                <Battery className="absolute right-3 top-3.5 text-gray-400" size={18} />
              </div>
            </div>
          </div>

          <div className={`mt-6 p-4 rounded-xl flex items-center justify-between ${status === 'good' ? 'bg-green-50 text-green-700 border border-green-200' : status === 'warning' ? 'bg-red-50 text-red-700 border border-red-200' : 'bg-gray-50 text-gray-700 border border-gray-200'}`}>
            <span className="font-bold">وضعیت توازن:</span>
            <span className="font-black text-lg">
              {status === 'good' ? 'متوازن (مازاد)' : status === 'warning' ? 'ناتراز (کسری)' : 'برابر'}
            </span>
          </div>
          {status === 'warning' && (
             <p className="text-sm text-red-600 mt-2 font-medium">هشدار: مصرف شما از تولید بیشتر است. این موضوع به باتری‌ها یا ژنراتور فشار مضاعف وارد می‌کند و عمر آنها را کاهش می‌دهد. پیشنهاد می‌شود مصرف را کاهش دهید یا توان تولید را بالا ببرید.</p>
          )}
        </div>

        
        <div className="bg-gradient-to-br from-indigo-50 to-blue-50 p-6 rounded-2xl shadow-sm border border-indigo-100 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-100 rounded-bl-full -z-0 opacity-50"></div>
          <h2 className="text-xl font-bold mb-4 flex items-center gap-2 relative z-10 text-indigo-900">
            <Camera className="text-indigo-600" />
            تحلیل هوشمند تجهیزات
          </h2>
          <p className="text-indigo-700 text-sm mb-6 relative z-10">
            تصاویری از پنل خورشیدی، ژنراتور، یا اینورتر خود که دارای مشکل هستند بارگذاری کنید تا هوش مصنوعی مشکل را تحلیل کند.
          </p>

          <div className="space-y-4 relative z-10">
            <div className="w-full bg-white border-2 border-dashed border-indigo-200 rounded-2xl p-6 flex flex-col items-center justify-center cursor-pointer hover:border-indigo-400 hover:bg-indigo-50/50 transition-colors" onClick={() => document.getElementById('image-upload')?.click()}>
              <Upload size={32} className="text-indigo-400 mb-2" />
              <span className="font-bold text-indigo-700">افزودن تصاویر تجهیزات</span>
              <span className="text-xs text-indigo-500 mt-1">فرمت‌های مجاز: JPG, PNG</span>
              <input 
                id="image-upload" 
                type="file" 
                multiple 
                accept="image/*" 
                className="hidden" 
                onChange={handleImageUpload} 
              />
            </div>

            {images.length > 0 && (
              <div className="flex flex-wrap gap-3 mt-4">
                {images.map((img, index) => (
                  <div key={index} className="relative w-20 h-20 rounded-xl overflow-hidden border border-gray-200 shadow-sm group">
                    <img src={img.previewUrl} alt="Equipment" className="w-full h-full object-cover" />
                    <button 
                      onClick={() => removeImage(index)}
                      className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <X size={12} />
                    </button>
                  </div>
                ))}
              </div>
            )}

            <div>
              <label className="block text-sm font-bold text-indigo-900 mb-2">توضیحات مشکل (اختیاری)</label>
              <textarea 
                value={problemDescription}
                onChange={e => setProblemDescription(e.target.value)}
                placeholder="توضیحاتی در مورد صدای غیرعادی، افت راندمان، یا تغییرات ظاهری بنویسید..."
                className="w-full px-4 py-3 rounded-xl border border-indigo-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 outline-none transition-all resize-none h-24"
              ></textarea>
            </div>

            <button 
              onClick={handleAnalyze}
              disabled={isAnalyzing || (images.length === 0 && !problemDescription)}
              className="w-full bg-indigo-600 text-white py-4 rounded-xl text-lg font-bold hover:bg-indigo-700 transition-colors shadow-md flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isAnalyzing ? (
                <><Loader2 className="animate-spin" size={24} /> در حال تحلیل...</>
              ) : (
                <><Search size={24} /> شروع تحلیل هوشمند</>
              )}
            </button>
          </div>

          {aiAnalysisResult && (
            <div className="mt-8 bg-white p-6 rounded-2xl border border-indigo-100 shadow-sm relative z-10">
              <h3 className="font-bold text-lg text-indigo-900 mb-4 border-b border-indigo-50 pb-2 flex items-center gap-2">
                <ShieldCheck size={20} className="text-green-500" />
                نتیجه تحلیل هوش مصنوعی
              </h3>
              <div className="prose prose-sm prose-indigo max-w-none markdown-body" dir="rtl">
                <Markdown>{aiAnalysisResult}</Markdown>
              </div>
            </div>
          )}
        </div>

        <div className="bg-white p-6 rounded-2xl shadow-sm border border-[#E4E7EC]">
          <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
            <Wrench className="text-blue-600" />
            زمان‌بندی دوره‌ای نگهداری
          </h2>
          <div className="space-y-4">
             <div className="flex items-start gap-4 p-4 border border-gray-100 rounded-xl bg-gray-50/50">
                <div className="w-12 h-12 bg-orange-100 text-orange-600 rounded-full flex items-center justify-center shrink-0">
                  <Sun size={24} />
                </div>
                <div>
                   <h3 className="font-bold text-gray-800">پنل‌های خورشیدی</h3>
                   <ul className="text-sm text-gray-600 mt-2 space-y-1 list-disc list-inside">
                     <li>شستشو و تمیزکاری: هر ۲ الی ۳ ماه (بسته به آلودگی هوا)</li>
                     <li>بررسی اتصالات و کابل‌ها: هر ۶ ماه</li>
                     <li>تعویض و افت راندمان: معمولاً بعد از ۲۵ سال</li>
                   </ul>
                </div>
             </div>
             <div className="flex items-start gap-4 p-4 border border-gray-100 rounded-xl bg-gray-50/50">
                <div className="w-12 h-12 bg-green-100 text-green-600 rounded-full flex items-center justify-center shrink-0">
                  <Zap size={24} />
                </div>
                <div>
                   <h3 className="font-bold text-gray-800">موتور برق و ژنراتور</h3>
                   <ul className="text-sm text-gray-600 mt-2 space-y-1 list-disc list-inside">
                     <li>تعویض روغن و فیلتر: هر ۱۰۰ ساعت کارکرد یا سالی یکبار</li>
                     <li>بررسی باتری استارت: هر ۶ ماه</li>
                     <li>تعمیرات اساسی (Overhaul): بعد از ۵۰۰۰ ساعت کارکرد</li>
                   </ul>
                </div>
             </div>
             <div className="flex items-start gap-4 p-4 border border-gray-100 rounded-xl bg-gray-50/50">
                <div className="w-12 h-12 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center shrink-0">
                  <Battery size={24} />
                </div>
                <div>
                   <h3 className="font-bold text-gray-800">باتری‌ها و اینورتر</h3>
                   <ul className="text-sm text-gray-600 mt-2 space-y-1 list-disc list-inside">
                     <li>بررسی دمای اتاق باتری: ماهانه</li>
                     <li>تست ظرفیت باتری‌ها: سالی یکبار</li>
                     <li>طول عمر مفید باتری لید-اسید: ۳ الی ۵ سال / لیتیوم: بیش از ۱۰ سال</li>
                   </ul>
                </div>
             </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl shadow-sm border border-[#E4E7EC]">
          <h2 className="text-xl font-bold mb-1">پیشنهاد کارشناسان</h2>
          <p className="text-gray-500 text-sm mb-6">کارشناسان مجرب ما آماده بازدید و بررسی شرایط سیستم شما هستند.</p>
          
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {experts.map(expert => (
              <div key={expert.id} className="border border-gray-200 rounded-xl p-4 flex flex-col items-center text-center hover:border-blue-500 transition-colors cursor-pointer">
                <img src={expert.photo} alt={expert.name} className="w-20 h-20 rounded-full mb-3 object-cover border-2 border-gray-100" />
                <h3 className="font-bold text-gray-800">{expert.name}</h3>
                <p className="text-xs text-blue-600 font-medium my-1 bg-blue-50 px-2 py-1 rounded-md">{expert.profession}</p>
                <p className="text-xs text-gray-500 mt-2 flex items-center gap-1 justify-center"><ShieldCheck size={14}/> {expert.exp}</p>
                <button className="mt-4 w-full bg-gray-900 text-white py-2 rounded-lg text-sm font-bold hover:bg-blue-600 transition-colors">
                  درخواست بازدید
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
