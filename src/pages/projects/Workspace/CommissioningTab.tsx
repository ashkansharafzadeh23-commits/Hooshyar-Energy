import React, { useState, useEffect } from 'react';
import { Loader2, Plus, CheckCircle, Clock, FileText, Settings, ShieldCheck } from 'lucide-react';

interface CommissioningTabProps {
  projectId: string;
}

export const CommissioningTab: React.FC<CommissioningTabProps> = ({ projectId }) => {
  const [loading, setLoading] = useState(false);
  const [records, setRecords] = useState<any[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const res = await fetch(`/api/projects/${projectId}/commissioning`);
        if (res.ok) {
          setRecords(await res.json());
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
          <h3 className="text-lg font-bold text-gray-900">مدیریت راه‌اندازی (Commissioning)</h3>
          <p className="text-sm text-gray-500">تست‌ها، بررسی‌ها و تحویل نهایی پروژه</p>
        </div>
        <button className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 flex items-center gap-2">
          <Plus size={16} />
          شروع راه‌اندازی
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-lg flex items-center justify-center">
            <Settings size={24} />
          </div>
          <div>
            <div className="text-2xl font-bold text-gray-900">۰</div>
            <div className="text-sm text-gray-500">تست‌های برنامه‌ریزی‌شده</div>
          </div>
        </div>
        <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 bg-green-50 text-green-600 rounded-lg flex items-center justify-center">
            <CheckCircle size={24} />
          </div>
          <div>
            <div className="text-2xl font-bold text-gray-900">۰</div>
            <div className="text-sm text-gray-500">تست‌های موفق</div>
          </div>
        </div>
        <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 bg-amber-50 text-amber-600 rounded-lg flex items-center justify-center">
            <Clock size={24} />
          </div>
          <div>
            <div className="text-2xl font-bold text-gray-900">۰</div>
            <div className="text-sm text-gray-500">در حال انجام</div>
          </div>
        </div>
        <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 bg-purple-50 text-purple-600 rounded-lg flex items-center justify-center">
            <ShieldCheck size={24} />
          </div>
          <div>
            <div className="text-2xl font-bold text-gray-900">--</div>
            <div className="text-sm text-gray-500">وضعیت دارایی</div>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="p-4 border-b border-gray-200 bg-gray-50 font-medium">
          لیست سوابق راه‌اندازی
        </div>
        <div className="p-4">
          {records.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              <Settings className="w-12 h-12 text-gray-300 mx-auto mb-4" />
              <p>هیچ سابقه راه‌اندازی برای این پروژه ثبت نشده است.</p>
              <p className="text-sm mt-2">برای تبدیل پروژه به دارایی انرژی (Energy Asset)، فرآیند راه‌اندازی را تکمیل کنید.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {records.map(rec => (
                <div key={rec.id} className="flex justify-between items-center border border-gray-100 p-4 rounded-lg">
                  <div>
                    <div className="font-bold text-gray-900">فرآیند راه‌اندازی</div>
                    <div className="text-sm text-gray-500">{new Date(rec.createdAt).toLocaleDateString('fa-IR')}</div>
                  </div>
                  <div>
                    <span className="inline-block px-2 py-1 bg-blue-50 text-blue-700 text-xs rounded-md">
                      {rec.status}
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
