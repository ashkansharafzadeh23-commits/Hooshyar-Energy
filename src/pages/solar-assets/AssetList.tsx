import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { MapPin, Zap, Calendar, ArrowLeft } from 'lucide-react';

export default function SolarAssetsList() {
  const [assets, setAssets] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAssets = async () => {
      try {
        const token = localStorage.getItem("token");
        const res = await fetch("/api/assets", {
          headers: token ? { Authorization: `Bearer ${token}` } : {},
        });
        if (res.ok) {
          const data = await res.json();
          setAssets(data);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchAssets();
  }, []);

  const getStatusBadge = (status: string) => {
    switch(status) {
      case 'APPROVED': return <span className="bg-emerald-100 text-emerald-800 text-xs px-2 py-1 rounded-full border border-emerald-200">تایید شده</span>;
      case 'DRAFT': return <span className="bg-zinc-100 text-zinc-800 text-xs px-2 py-1 rounded-full border border-zinc-200">پیش‌نویس</span>;
      case 'SUBMITTED': return <span className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full border border-blue-200">در انتظار بررسی</span>;
      default: return <span className="bg-zinc-100 text-zinc-800 text-xs px-2 py-1 rounded-full border border-zinc-200">{status}</span>;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-zinc-900 dark:text-zinc-100">پروژه‌های خورشیدی</h2>
          <p className="text-zinc-500 dark:text-zinc-400 mt-1">لیست دارایی‌های خورشیدی و نیروگاه‌های ثبت شده</p>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center p-12">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      ) : assets.length === 0 ? (
        <div className="text-center py-12 bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800">
          <p className="text-zinc-500">پروژه‌ای برای نمایش وجود ندارد.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {assets.map((asset) => (
            <div key={asset.id} className="bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800 shadow-sm overflow-hidden flex flex-col transition-shadow hover:shadow-md">
              <div className="p-5 flex-1">
                <div className="flex justify-between items-start mb-4">
                  <h3 className="font-bold text-lg text-zinc-900 dark:text-zinc-100 line-clamp-2">{asset.projectName}</h3>
                  {getStatusBadge(asset.projectStatus)}
                </div>
                
                <div className="space-y-2 mt-4 text-sm text-zinc-600 dark:text-zinc-400">
                  <div className="flex items-center gap-2">
                    <MapPin size={16} className="text-zinc-400" />
                    <span>{asset.location.city || "نامشخص"}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Zap size={16} className="text-zinc-400" />
                    <span>{asset.capacityKw > 0 ? `${asset.capacityKw} کیلووات` : "در انتظار تکمیل اطلاعات"}</span>
                  </div>
                </div>
              </div>
              <div className="bg-zinc-50 dark:bg-zinc-950/50 p-4 border-t border-zinc-100 dark:border-zinc-800">
                <Link to={`/solar-assets/${asset.id}`} className="flex items-center justify-center gap-2 w-full text-blue-600 hover:text-blue-700 font-medium text-sm transition-colors">
                  مشاهده پروژه <ArrowLeft size={16} />
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
