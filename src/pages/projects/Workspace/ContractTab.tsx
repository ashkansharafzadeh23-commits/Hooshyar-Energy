import React, { useState, useEffect } from 'react';
import { ProjectContract } from '../../../types/execution';
import { Loader2, FileText, CheckCircle, Clock } from 'lucide-react';

interface ContractTabProps {
  projectId: string;
}

export const ContractTab: React.FC<ContractTabProps> = ({ projectId }) => {
  const [contracts, setContracts] = useState<ProjectContract[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchContracts();
  }, [projectId]);

  const fetchContracts = async () => {
    try {
      const res = await fetch(`/api/execution/${projectId}/contracts`);
      if (res.ok) if (!res.ok) throw new Error();
      setContracts(await res.json());
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateContract = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/execution/${projectId}/contracts`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contractCode: `CNT-${Math.floor(Math.random() * 10000)}`,
          title: 'قرارداد EPC فاز اول احداث',
          contractType: 'EPC',
          currency: 'IRR',
          contractValue: 12000000000,
          createdByUserId: 'user-id',
        }),
      });
      if (res.ok) {
        fetchContracts();
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="p-8 flex justify-center"><Loader2 className="animate-spin text-blue-500" /></div>;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center bg-white p-6 rounded-2xl shadow-sm border border-gray-200">
        <div>
          <h2 className="text-xl font-bold text-gray-800 mb-2">مدیریت قراردادها</h2>
          <p className="text-sm text-gray-500">مشاهده و مدیریت اسناد قراردادی پروژه و الحاقیه‌ها</p>
        </div>
        <button 
          onClick={handleCreateContract}
          className="bg-blue-600 text-white px-4 py-2 rounded-xl text-sm font-bold hover:bg-blue-700 transition-colors"
        >
          ایجاد قرارداد (نسخه اولیه)
        </button>
      </div>

      {contracts.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-2xl border border-gray-200 shadow-sm">
          <FileText size={48} className="mx-auto text-gray-300 mb-4" />
          <h3 className="text-lg font-bold text-gray-700">قراردادی ثبت نشده است</h3>
          <p className="text-gray-500 text-sm mt-2">شما هنوز هیچ قراردادی برای این پروژه ایجاد نکرده‌اید.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {contracts.map(contract => (
            <div key={contract.id} className="bg-white p-6 rounded-2xl shadow-sm border border-gray-200">
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center">
                    <FileText size={24} />
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-900">{contract.title}</h3>
                    <div className="text-sm text-gray-500 flex gap-4 mt-1">
                      <span>کد: {contract.contractCode}</span>
                      <span>نوع: {contract.contractType}</span>
                    </div>
                  </div>
                </div>
                <div className="mt-4 md:mt-0 px-3 py-1.5 bg-yellow-50 text-yellow-700 rounded-lg text-sm font-bold flex items-center gap-2 border border-yellow-200">
                  <Clock size={16} />
                  وضعیت: {contract.status}
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                <div className="bg-gray-50 p-4 rounded-xl border border-gray-100">
                  <div className="text-xs text-gray-500 mb-1">مبلغ قرارداد</div>
                  <div className="font-bold text-gray-900">{contract.contractValue.toLocaleString()} {contract.currency}</div>
                </div>
                <div className="bg-gray-50 p-4 rounded-xl border border-gray-100">
                  <div className="text-xs text-gray-500 mb-1">تاریخ ایجاد</div>
                  <div className="font-bold text-gray-900">{new Date(contract.createdAt).toLocaleDateString('fa-IR')}</div>
                </div>
                <div className="bg-gray-50 p-4 rounded-xl border border-gray-100">
                  <div className="text-xs text-gray-500 mb-1">نسخه الحاقیه</div>
                  <div className="font-bold text-gray-900">نسخه اصلی (پایه)</div>
                </div>
              </div>

              <div className="flex flex-wrap gap-2 pt-4 border-t border-gray-100">
                <button className="text-sm bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold py-2 px-4 rounded-lg transition-colors">
                  مشاهده جزییات
                </button>
                <button className="text-sm bg-emerald-50 hover:bg-emerald-100 text-emerald-700 font-bold py-2 px-4 rounded-lg transition-colors border border-emerald-200">
                  آپلود نسخه امضا شده
                </button>
                {contract.status === 'DRAFT' && (
                   <button className="text-sm bg-blue-50 hover:bg-blue-100 text-blue-700 font-bold py-2 px-4 rounded-lg transition-colors border border-blue-200">
                   تایید و فعال‌سازی
                 </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
