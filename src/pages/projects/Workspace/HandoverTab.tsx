import React, { useState, useEffect } from 'react';
import { Loader2, Plus, CheckCircle, Clock, FileText, ArrowRightLeft } from 'lucide-react';

interface HandoverTabProps {
  projectId: string;
}

export const HandoverTab: React.FC<HandoverTabProps> = ({ projectId }) => {
  const [loading, setLoading] = useState(false);
  const [handovers, setHandovers] = useState<any[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const res = await fetch(`/api/projects/${projectId}/handover`);
        if (res.ok) {
          const data = await res.json();
          // The API returns a single handover object if it exists, or undefined. Handle accordingly.
          if (data && data.id) {
            setHandovers([data]);
          } else if (Array.isArray(data)) {
            setHandovers(data);
          }
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
          <h3 className="text-lg font-bold text-gray-900">مدیریت تحویل (Handover)</h3>
          <p className="text-sm text-gray-500">مستندات نهایی، گارانتی‌ها و انتقال مالکیت عملیاتی</p>
        </div>
        <button className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 flex items-center gap-2">
          <Plus size={16} />
          ثبت تحویل جدید
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-lg flex items-center justify-center">
            <FileText size={24} />
          </div>
          <div>
            <div className="text-2xl font-bold text-gray-900">
               {handovers.length > 0 && handovers[0].documentsComplete ? 'تکمیل' : 'ناقص'}
            </div>
            <div className="text-sm text-gray-500">اسناد As-built</div>
          </div>
        </div>
        <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 bg-green-50 text-green-600 rounded-lg flex items-center justify-center">
            <CheckCircle size={24} />
          </div>
          <div>
            <div className="text-2xl font-bold text-gray-900">
               {handovers.length > 0 && handovers[0].warrantyDelivered ? 'تکمیل' : 'ناقص'}
            </div>
            <div className="text-sm text-gray-500">مدارک گارانتی</div>
          </div>
        </div>
        <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 bg-amber-50 text-amber-600 rounded-lg flex items-center justify-center">
            <Clock size={24} />
          </div>
          <div>
            <div className="text-2xl font-bold text-gray-900">
               {handovers.length > 0 && handovers[0].trainingComplete ? 'انجام شد' : 'منتظر'}
            </div>
            <div className="text-sm text-gray-500">آموزش بهره‌بردار</div>
          </div>
        </div>
        <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 bg-purple-50 text-purple-600 rounded-lg flex items-center justify-center">
            <ArrowRightLeft size={24} />
          </div>
          <div>
            <div className="text-2xl font-bold text-gray-900">
              {handovers.length > 0 ? handovers[0].status : '--'}
            </div>
            <div className="text-sm text-gray-500">وضعیت تحویل</div>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="p-4 border-b border-gray-200 bg-gray-50 font-medium">
          گزارش تحویل پروژه
        </div>
        <div className="p-4">
          {handovers.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              <ArrowRightLeft className="w-12 h-12 text-gray-300 mx-auto mb-4" />
              <p>فرآیند تحویل (Handover) برای این پروژه آغاز نشده است.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {handovers.map(h => (
                <div key={h.id} className="flex justify-between items-center border border-gray-100 p-4 rounded-lg">
                  <div>
                    <div className="font-bold text-gray-900">صورت‌جلسه تحویل نهایی</div>
                    <div className="text-sm text-gray-500">{h.handoverDate ? new Date(h.handoverDate).toLocaleDateString('fa-IR') : 'تاریخ ثبت نشده'}</div>
                  </div>
                  <div>
                    <span className="inline-block px-2 py-1 bg-blue-50 text-blue-700 text-xs rounded-md">
                      {h.status}
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
