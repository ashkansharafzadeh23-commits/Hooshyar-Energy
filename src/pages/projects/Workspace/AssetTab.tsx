import React, { useState, useEffect } from 'react';
import { Loader2, Plus, Zap, CheckCircle, Clock, ShieldCheck } from 'lucide-react';
import { EnergyAsset } from '../../../types/asset';

interface AssetTabProps {
  projectId: string;
}

export const AssetTab: React.FC<AssetTabProps> = ({ projectId }) => {
  const [loading, setLoading] = useState(false);
  const [assets, setAssets] = useState<EnergyAsset[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const res = await fetch(`/api/projects/${projectId}/assets`);
        if (res.ok) {
          setAssets(await res.json());
        }
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [projectId]);

  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-lg font-bold text-gray-900">دارایی انرژی (Energy Asset)</h3>
          <p className="text-sm text-gray-500">پاسپورت دارایی و تجهیزات نهایی ثبت‌شده</p>
        </div>
        <button className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 flex items-center gap-2">
          <Plus size={16} />
          ایجاد دارایی
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-lg flex items-center justify-center">
            <Zap size={24} />
          </div>
          <div>
            <div className="text-2xl font-bold text-gray-900">{assets.length > 0 ? assets[0]?.installedCapacityKw : 0} kW</div>
            <div className="text-sm text-gray-500">ظرفیت نصب‌شده</div>
          </div>
        </div>
        <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 bg-green-50 text-green-600 rounded-lg flex items-center justify-center">
            <CheckCircle size={24} />
          </div>
          <div>
            <div className="text-2xl font-bold text-gray-900">{assets.length > 0 ? assets[0]?.assetType : '--'}</div>
            <div className="text-sm text-gray-500">نوع دارایی</div>
          </div>
        </div>
        <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 bg-amber-50 text-amber-600 rounded-lg flex items-center justify-center">
            <Clock size={24} />
          </div>
          <div>
            <div className="text-2xl font-bold text-gray-900">--</div>
            <div className="text-sm text-gray-500">تجهیزات ثبت‌شده</div>
          </div>
        </div>
        <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 bg-purple-50 text-purple-600 rounded-lg flex items-center justify-center">
            <ShieldCheck size={24} />
          </div>
          <div>
            <div className="text-2xl font-bold text-gray-900">{assets.length > 0 ? assets[0]?.status : '--'}</div>
            <div className="text-sm text-gray-500">وضعیت عملیاتی</div>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="p-4 border-b border-gray-200 bg-gray-50 font-medium">
          لیست دارایی‌ها (Asset Passport)
        </div>
        <div className="p-4">
          {assets.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              <Zap className="w-12 h-12 text-gray-300 mx-auto mb-4" />
              <p>این پروژه هنوز به یک دارایی انرژی تبدیل نشده است.</p>
              <p className="text-sm mt-2">پس از تأیید راه‌اندازی و تحویل نهایی، دارایی انرژی ثبت می‌گردد.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {assets.map(asset => (
                <div key={asset.id} className="flex justify-between items-center border border-gray-100 p-4 rounded-lg">
                  <div>
                    <div className="font-bold text-gray-900">{asset.name || asset.assetCode}</div>
                    <div className="text-sm text-gray-500">تاریخ بهره‌برداری: {asset.commercialOperationDate ? new Date(asset.commercialOperationDate).toLocaleDateString('fa-IR') : 'مشخص نشده'}</div>
                  </div>
                  <div>
                    <span className="inline-block px-2 py-1 bg-green-50 text-green-700 text-xs rounded-md">
                      {asset.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
