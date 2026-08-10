const fs = require('fs');
let code = fs.readFileSync('src/pages/SmartMaintenance.tsx', 'utf-8');

const targetImport = "import { ArrowLeft, Settings,  Wrench, ShieldCheck, Search, Battery, Sun, Zap } from 'lucide-react';";
const newImport = "import { ArrowLeft, Settings,  Wrench, ShieldCheck, Search, Battery, Sun, Zap, Camera, Upload, Loader2, Image as ImageIcon, X } from 'lucide-react';\nimport Markdown from 'react-markdown';";

code = code.replace(targetImport, newImport);

const stateCode = `
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
`;

const stateTarget = "const [experts, setExperts] = useState([";
code = code.replace(stateTarget, stateCode + "\n  " + stateTarget);

const aiSection = `
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
`;

code = code.replace('<div className="bg-white p-6 rounded-2xl shadow-sm border border-[#E4E7EC]">\n          <h2 className="text-xl font-bold mb-4 flex items-center gap-2">', aiSection + '\n        <div className="bg-white p-6 rounded-2xl shadow-sm border border-[#E4E7EC]">\n          <h2 className="text-xl font-bold mb-4 flex items-center gap-2">');

fs.writeFileSync('src/pages/SmartMaintenance.tsx', code);
