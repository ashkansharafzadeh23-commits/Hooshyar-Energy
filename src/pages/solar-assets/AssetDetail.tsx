import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { MapPin, Zap, Calendar, FileText, CheckCircle2, Clock, ShieldAlert, Activity } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

export default function SolarAssetDetail() {
  const { id } = useParams<{ id: string }>();
  const [asset, setAsset] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAsset = async () => {
      try {
        const token = localStorage.getItem("token");
        const res = await fetch(`/api/assets/${id}`, {
          headers: token ? { Authorization: `Bearer ${token}` } : {},
        });
        if (res.ok) {
          const data = await res.json();
          setAsset(data);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchAsset();
  }, [id]);

  if (loading) {
    return (
      <div className="flex justify-center p-12">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (!asset) {
    return (
      <div className="text-center py-12 bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800">
        <p className="text-zinc-500">پروژه یافت نشد یا شما دسترسی ندارید.</p>
        <Link to="/solar-assets" className="text-blue-600 mt-4 inline-block">بازگشت به لیست پروژه‌ها</Link>
      </div>
    );
  }

  // Generate some realistic mock log data based on capacity
  const baseCapacity = asset.capacityKw || 10;
  const mockPerformanceData = [
    { name: 'فروردین', predicted: baseCapacity * 135, actual: baseCapacity * 130 },
    { name: 'اردیبهشت', predicted: baseCapacity * 145, actual: baseCapacity * 148 },
    { name: 'خرداد', predicted: baseCapacity * 155, actual: baseCapacity * 150 },
    { name: 'تیر', predicted: baseCapacity * 165, actual: baseCapacity * 160 },
    { name: 'مرداد', predicted: baseCapacity * 160, actual: baseCapacity * 158 },
    { name: 'شهریور', predicted: baseCapacity * 150, actual: baseCapacity * 145 },
  ];

  return (
    <div className="space-y-6">
      <div className="bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800 overflow-hidden shadow-sm p-6 sm:p-8">
        <div className="flex flex-col sm:flex-row justify-between items-start gap-4 mb-8">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-zinc-900 dark:text-zinc-100">{asset.projectName}</h1>
            <p className="text-zinc-500 dark:text-zinc-400 mt-2 flex items-center gap-2">
              <MapPin size={16} /> {asset.location?.city || "نامشخص"}
            </p>
          </div>
          <div className="bg-zinc-100 dark:bg-zinc-800 px-4 py-2 rounded-lg font-medium text-sm text-zinc-700 dark:text-zinc-300">
            وضعیت: {asset.projectStatus}
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-zinc-50 dark:bg-zinc-800/50 p-4 rounded-xl border border-zinc-100 dark:border-zinc-800">
            <div className="flex items-center gap-2 text-zinc-500 dark:text-zinc-400 mb-2">
              <Zap size={18} />
              <span className="text-sm font-medium">ظرفیت نیروگاه</span>
            </div>
            <div className="text-xl font-bold text-zinc-900 dark:text-zinc-100">
              {asset.capacityKw > 0 ? `${asset.capacityKw} کیلووات` : "در انتظار تکمیل اطلاعات"}
            </div>
          </div>
          <div className="bg-zinc-50 dark:bg-zinc-800/50 p-4 rounded-xl border border-zinc-100 dark:border-zinc-800">
            <div className="flex items-center gap-2 text-zinc-500 dark:text-zinc-400 mb-2">
              <Calendar size={18} />
              <span className="text-sm font-medium">طول عمر پروژه</span>
            </div>
            <div className="text-xl font-bold text-zinc-900 dark:text-zinc-100">
              {asset.projectLifetimeYears ? `${asset.projectLifetimeYears} سال` : "در انتظار تکمیل اطلاعات"}
            </div>
          </div>
          <div className="bg-zinc-50 dark:bg-zinc-800/50 p-4 rounded-xl border border-zinc-100 dark:border-zinc-800">
            <div className="flex items-center gap-2 text-zinc-500 dark:text-zinc-400 mb-2">
              <ShieldAlert size={18} />
              <span className="text-sm font-medium">وضعیت احراز</span>
            </div>
            <div className="text-xl font-bold text-zinc-900 dark:text-zinc-100">
              {asset.verificationStatus === 'verified' ? 'تایید شده' : 'بررسی نشده'}
            </div>
          </div>
        </div>

        <div className="mb-8 border border-zinc-200 dark:border-zinc-800 rounded-xl p-5 sm:p-6 bg-white dark:bg-zinc-900">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 dark:text-indigo-400 rounded-lg flex items-center justify-center">
              <Activity size={20} />
            </div>
            <div>
              <h3 className="text-lg font-bold text-zinc-900 dark:text-zinc-100">عملکرد انرژی نیروگاه</h3>
              <p className="text-sm text-zinc-500 dark:text-zinc-400">مقایسه تولید واقعی و پیش‌بینی شده (کیلووات ساعت)</p>
            </div>
          </div>
          <div className="h-72 w-full mt-4" style={{ direction: 'ltr' }}>
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={mockPerformanceData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e4e4e7" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#71717a' }} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#71717a' }} dx={-10} />
                <Tooltip 
                  contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                  labelStyle={{ fontWeight: 'bold', marginBottom: '8px', color: '#18181b', textAlign: 'right' }}
                />
                <Legend iconType="circle" wrapperStyle={{ fontSize: '12px', paddingTop: '20px' }} />
                <Line type="monotone" dataKey="actual" name="تولید واقعی" stroke="#4f46e5" strokeWidth={3} dot={{ r: 4, strokeWidth: 2 }} activeDot={{ r: 6 }} isAnimationActive={true} animationBegin={300} animationDuration={2000} animationEasing="ease-out" />
                <Line type="monotone" dataKey="predicted" name="پیش‌بینی اولیه" stroke="#94a3b8" strokeWidth={2} strokeDasharray="5 5" dot={false} isAnimationActive={true} animationBegin={100} animationDuration={2000} animationEasing="ease-out" />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-blue-50/50 dark:bg-blue-900/10 border border-blue-100 dark:border-blue-900/30 rounded-xl p-5 mb-8">
          <h3 className="text-blue-800 dark:text-blue-300 font-semibold mb-2">به‌زودی</h3>
          <p className="text-sm text-blue-600 dark:text-blue-400 leading-relaxed">
            تحلیل مالی، امتیاز هوش مصنوعی، و اطلاعات مشارکت برای این پروژه به‌زودی در نسخه‌های بعدی اضافه می‌شود.
          </p>
        </div>

        <div>
          <h3 className="text-lg font-bold text-zinc-900 dark:text-zinc-100 mb-4">مستندات پروژه</h3>
          {asset.documents && asset.documents.length > 0 ? (
            <div className="space-y-3">
              {asset.documents.map((doc: any) => (
                <div key={doc.id} className="flex items-center justify-between p-4 border border-zinc-200 dark:border-zinc-800 rounded-lg bg-zinc-50/50 dark:bg-zinc-800/30">
                  <div className="flex items-center gap-3">
                    <FileText className="text-zinc-400" size={20} />
                    <span className="font-medium text-sm text-zinc-700 dark:text-zinc-300">{doc.documentType}</span>
                  </div>
                  <div className="flex items-center gap-2 text-xs">
                    {doc.verificationStatus === 'verified' ? (
                      <span className="flex items-center gap-1 text-emerald-600 bg-emerald-50 px-2 py-1 rounded-md"><CheckCircle2 size={14} /> تایید شده</span>
                    ) : (
                      <span className="flex items-center gap-1 text-amber-600 bg-amber-50 px-2 py-1 rounded-md"><Clock size={14} /> در حال بررسی</span>
                    )}
                    <a href={doc.fileUrl} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline mr-4">مشاهده</a>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-zinc-500">هیچ مستندی برای این پروژه آپلود نشده یا مستندات تایید شده وجود ندارد.</p>
          )}
        </div>
      </div>
    </div>
  );
}
