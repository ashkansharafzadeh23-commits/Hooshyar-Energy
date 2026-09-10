import React, { useState, useEffect } from 'react';
import { ProjectMilestone } from '../../../types/execution';
import { Loader2, Calendar, CheckCircle2, Clock, PlayCircle } from 'lucide-react';

interface MilestonesTabProps {
  projectId: string;
}

export const MilestonesTab: React.FC<MilestonesTabProps> = ({ projectId }) => {
  const [milestones, setMilestones] = useState<ProjectMilestone[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchMilestones();
  }, [projectId]);

  const fetchMilestones = async () => {
    try {
      const res = await fetch(`/api/execution/${projectId}/milestones`);
      if (res.ok) {
        const data = await res.json();
        // Sort by sequence
        setMilestones(data.sort((a: any, b: any) => a.sequence - b.sequence));
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const overallProgress = milestones.length > 0 
    ? milestones.reduce((sum, m) => sum + (m.weightPercent * (m.completionPercent / 100)), 0)
    : 0;

  const handleUpdateStatus = async (id: string, status: string, completionPercent: number) => {
    try {
      await fetch(`/api/execution/${projectId}/milestones/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status, completionPercent })
      });
      fetchMilestones();
    } catch (e) {
      console.error(e);
    }
  };

  if (loading) return <div className="p-8 flex justify-center"><Loader2 className="animate-spin text-fuchsia-500" /></div>;

  return (
    <div className="space-y-6">
      
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-200">
        <h2 className="text-xl font-bold text-gray-800 mb-6">پیشرفت فیزیکی پروژه</h2>
        
        <div className="mb-2 flex justify-between items-center text-sm">
          <span className="font-bold text-gray-700">پیشرفت کل (موزون):</span>
          <span className="font-black text-blue-600 text-lg">{overallProgress.toFixed(1)}%</span>
        </div>
        <div className="w-full h-4 bg-gray-100 rounded-full overflow-hidden border border-gray-200">
          <div 
            className="h-full bg-gradient-to-r from-blue-500 to-indigo-600 rounded-full transition-all duration-1000" 
            style={{ width: `${overallProgress}%` }}
          ></div>
        </div>
      </div>

      {milestones.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-2xl border border-gray-200 shadow-sm">
          <Calendar size={48} className="mx-auto text-gray-300 mb-4" />
          <h3 className="text-lg font-bold text-gray-700">مایل‌استون‌ها هنوز ایجاد نشده‌اند</h3>
          <p className="text-gray-500 text-sm mt-2">ابتدا باید یک قرارداد معتبر تایید و فعال شود تا برنامه زمان‌بندی پروژه شکل بگیرد.</p>
        </div>
      ) : (
        <div className="space-y-4 relative">
          <div className="absolute top-0 bottom-0 right-8 w-0.5 bg-gray-200 z-0 hidden md:block"></div>
          
          {milestones.map((milestone, idx) => (
            <div key={milestone.id} className="relative z-10 flex flex-col md:flex-row gap-6">
              
              <div className="hidden md:flex flex-col items-center justify-start pt-6">
                <div className={`w-16 h-16 rounded-full flex items-center justify-center font-black text-xl shadow-sm border-4 border-white ${
                  milestone.status === 'COMPLETED' ? 'bg-emerald-100 text-emerald-600' :
                  milestone.status === 'IN_PROGRESS' ? 'bg-blue-100 text-blue-600' :
                  'bg-gray-100 text-gray-400'
                }`}>
                  {idx + 1}
                </div>
              </div>

              <div className="flex-1 bg-white p-6 rounded-2xl shadow-sm border border-gray-200 hover:shadow-md transition-shadow">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-4">
                  <div>
                    <h3 className="text-lg font-bold text-gray-900 mb-1">{milestone.title}</h3>
                    <div className="flex items-center gap-3 text-xs text-gray-500">
                      <span className="bg-gray-100 px-2 py-1 rounded">{milestone.milestoneCode}</span>
                      <span>دسته: {milestone.category}</span>
                      <span className="font-bold text-gray-700">وزن فیزیکی: {milestone.weightPercent}%</span>
                    </div>
                  </div>
                  
                  <div className="mt-3 md:mt-0">
                    <span className={`px-3 py-1.5 rounded-lg text-xs font-bold border ${
                      milestone.status === 'COMPLETED' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' :
                      milestone.status === 'IN_PROGRESS' ? 'bg-blue-50 text-blue-700 border-blue-200' :
                      'bg-gray-50 text-gray-600 border-gray-200'
                    }`}>
                      وضعیت: {milestone.status}
                    </span>
                  </div>
                </div>

                <div className="flex flex-wrap gap-2 mt-6 pt-4 border-t border-gray-100">
                  {milestone.status === 'NOT_STARTED' && (
                    <button 
                      onClick={() => handleUpdateStatus(milestone.id, 'IN_PROGRESS', 10)}
                      className="text-xs bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-lg flex items-center gap-1 transition-colors"
                    >
                      <PlayCircle size={16}/> شروع عملیات
                    </button>
                  )}
                  {milestone.status === 'IN_PROGRESS' && (
                    <button 
                      onClick={() => handleUpdateStatus(milestone.id, 'SUBMITTED_FOR_REVIEW', 95)}
                      className="text-xs bg-amber-500 hover:bg-amber-600 text-white font-bold py-2 px-4 rounded-lg flex items-center gap-1 transition-colors"
                    >
                      <CheckCircle2 size={16}/> ثبت تحویل موقت (نیاز به تایید)
                    </button>
                  )}
                  {milestone.status === 'SUBMITTED_FOR_REVIEW' && (
                    <button 
                      onClick={() => handleUpdateStatus(milestone.id, 'COMPLETED', 100)}
                      className="text-xs bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-2 px-4 rounded-lg flex items-center gap-1 transition-colors"
                    >
                      <CheckCircle2 size={16}/> تایید کارفرما (اتمام)
                    </button>
                  )}
                  <button className="text-xs bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold py-2 px-4 rounded-lg transition-colors">
                    مشاهده مدارک مستند
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
