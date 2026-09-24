import React, { useState, useEffect } from 'react';
import { 
  Settings, 
  AlertTriangle, 
  Stethoscope, 
  FileText, 
  UserPlus, 
  History, 
  Calculator, 
  RefreshCw, 
  Plus, 
  Zap, 
  Building,
  CheckCircle,
  ShieldCheck,
  Loader2
} from 'lucide-react';
import { AdBanner } from '../components/AdBanner';
import { AlertDashboard } from '../components/maintenance/AlertDashboard';
import { DiagnosisView } from '../components/maintenance/DiagnosisView';
import { CaseList } from '../components/maintenance/CaseList';
import { CaseDetailModal } from '../components/maintenance/CaseDetailModal';
import { TechnicianMatcher } from '../components/maintenance/TechnicianMatcher';
import { MaintenanceHistory } from '../components/maintenance/MaintenanceHistory';
import { 
  AssetAlert, 
  MaintenanceCase, 
  MaintenanceDiagnosis, 
  MaintenanceAction, 
  TechnicianMatch,
  MaintenanceAssignmentHistory 
} from '../types/maintenance';

export default function SmartMaintenance() {
  const [activeTab, setActiveTab] = useState<'ALERTS' | 'DIAGNOSIS' | 'CASES' | 'MATCHING' | 'HISTORY' | 'CALCULATOR'>('ALERTS');
  
  // Projects and selection
  const [projects, setProjects] = useState<any[]>([]);
  const [selectedProjectId, setSelectedProjectId] = useState<string>('');
  
  // Maintenance entities
  const [alerts, setAlerts] = useState<AssetAlert[]>([]);
  const [cases, setCases] = useState<MaintenanceCase[]>([]);
  const [selectedAlert, setSelectedAlert] = useState<AssetAlert | null>(null);
  const [currentDiagnosis, setCurrentDiagnosis] = useState<MaintenanceDiagnosis | null>(null);
  
  // Detail Modal & Action states
  const [selectedCase, setSelectedCase] = useState<MaintenanceCase | null>(null);
  const [caseActions, setCaseActions] = useState<MaintenanceAction[]>([]);
  const [matchingCase, setMatchingCase] = useState<MaintenanceCase | null>(null);
  const [technicians, setTechnicians] = useState<TechnicianMatch[]>([]);
  const [assignmentHistories, setAssignmentHistories] = useState<MaintenanceAssignmentHistory[]>([]);

  // Loaders
  const [loading, setLoading] = useState(false);
  const [diagLoading, setDiagLoading] = useState(false);
  const [matchLoading, setMatchLoading] = useState(false);
  const [modalLoading, setModalLoading] = useState(false);

  // New Case Quick Modal
  const [showNewCaseModal, setShowNewCaseModal] = useState(false);
  const [newCaseTitle, setNewCaseTitle] = useState('');
  const [newCaseDesc, setNewCaseDesc] = useState('');
  const [newCasePriority, setNewCasePriority] = useState<string>('MEDIUM');

  // Energy balance state (preserving previous calculator)
  const [generation, setGeneration] = useState(5000);
  const [consumption, setConsumption] = useState(4500);

  const getAuthHeaders = () => {
    const token = localStorage.getItem('token');
    return {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {})
    };
  };

  // Fetch initial project list and maintenance data
  useEffect(() => {
    fetchInitialData();
  }, []);

  const fetchInitialData = async () => {
    setLoading(true);
    try {
      // 1. Fetch projects
      const projRes = await fetch('/api/projects', { headers: getAuthHeaders() });
      if (projRes.ok) {
        const pData = await projRes.json();
        const list = Array.isArray(pData) ? pData : pData.projects || [];
        setProjects(list);
        if (list.length > 0 && !selectedProjectId) {
          setSelectedProjectId(list[0].id);
        }
      }

      // 2. Fetch alerts
      await fetchAlerts();
      // 3. Fetch cases
      await fetchCases();
    } catch (err) {
      console.error('Error fetching maintenance initial data:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchAlerts = async (projectId?: string) => {
    try {
      const pid = projectId || selectedProjectId;
      const url = pid ? `/api/maintenance/alerts?projectId=${pid}` : '/api/maintenance/alerts';
      const res = await fetch(url, { headers: getAuthHeaders() });
      if (res.ok) {
        const data = await res.json();
        setAlerts(Array.isArray(data) ? data : data.alerts || []);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const fetchCases = async (projectId?: string) => {
    try {
      const pid = projectId || selectedProjectId;
      const url = pid ? `/api/maintenance/cases?projectId=${pid}` : '/api/maintenance/cases';
      const res = await fetch(url, { headers: getAuthHeaders() });
      if (res.ok) {
        const data = await res.json();
        setCases(Array.isArray(data) ? data : data.cases || []);
      }
    } catch (e) {
      console.error(e);
    }
  };

  // Switch active project
  const handleProjectChange = (pid: string) => {
    setSelectedProjectId(pid);
    fetchAlerts(pid);
    fetchCases(pid);
  };

  // Acknowledge Alert
  const handleAcknowledgeAlert = async (alertId: string) => {
    try {
      const res = await fetch(`/api/maintenance/alerts/${alertId}/acknowledge`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({ note: 'بررسی اولیه توسط مسئول پایش انجام شد.' })
      });
      if (res.ok) {
        await fetchAlerts();
      }
    } catch (e) {
      console.error(e);
    }
  };

  // Dismiss Alert
  const handleDismissAlert = async (alertId: string) => {
    try {
      const res = await fetch(`/api/maintenance/alerts/${alertId}/dismiss`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({ reason: 'هشدار گذرا یا کاذب ارزیابی شد.' })
      });
      if (res.ok) {
        await fetchAlerts();
      }
    } catch (e) {
      console.error(e);
    }
  };

  // Run Diagnosis
  const handleDiagnoseAlert = async (alert: AssetAlert) => {
    setSelectedAlert(alert);
    setActiveTab('DIAGNOSIS');
    setDiagLoading(true);
    try {
      const res = await fetch(`/api/maintenance/alerts/${alert.id}/diagnose`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({ triggerAiAssisted: true })
      });
      if (res.ok) {
        const diagData = await res.json();
        setCurrentDiagnosis(diagData.diagnosis || diagData);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setDiagLoading(false);
    }
  };

  // Create Case from Alert
  const handleCreateCaseFromAlert = async (alert: AssetAlert) => {
    try {
      const res = await fetch('/api/maintenance/cases', {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({
          projectId: alert.projectId,
          assetId: alert.assetId,
          alertId: alert.id,
          title: `رسیدگی به: ${alert.title}`,
          description: alert.description || `ارجاع خرابی از هشدار شماره ${alert.alertCode}`,
          priority: alert.severity === 'CRITICAL' ? 'URGENT' : alert.severity === 'HIGH' ? 'HIGH' : 'MEDIUM'
        })
      });
      if (res.ok) {
        await fetchAlerts();
        await fetchCases();
        setActiveTab('CASES');
      }
    } catch (e) {
      console.error(e);
    }
  };

  // Create Case from Diagnosis
  const handleCreateCaseFromDiagnosis = async (alert: AssetAlert, diagnosis: MaintenanceDiagnosis) => {
    try {
      const res = await fetch('/api/maintenance/cases', {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({
          projectId: alert.projectId,
          assetId: alert.assetId,
          alertId: alert.id,
          title: `اقدام اصلاحی: ${alert.title}`,
          description: diagnosis.confidenceScore !== undefined && diagnosis.confidenceScore !== null
            ? `تشخیص ثبت‌شده با سطح اطمینان ${Math.round(diagnosis.confidenceScore * 100)}%`
            : 'تشخیص ثبت‌شده بر اساس شواهد پایش فنی',
          priority: alert.severity === 'CRITICAL' ? 'URGENT' : 'HIGH',
          rootCause: diagnosis.possibleCauses?.[0] || 'تحلیل قواعد تشخیص'
        })
      });
      if (res.ok) {
        await fetchCases();
        setActiveTab('CASES');
      }
    } catch (e) {
      console.error(e);
    }
  };

  // Select Case for Detail Modal
  const handleSelectCase = async (mCase: MaintenanceCase) => {
    setSelectedCase(mCase);
    setModalLoading(true);
    try {
      const res = await fetch(`/api/maintenance/cases/${mCase.id}/actions`, {
        headers: getAuthHeaders()
      });
      if (res.ok) {
        const data = await res.json();
        setCaseActions(Array.isArray(data) ? data : data.actions || []);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setModalLoading(false);
    }
  };

  // Add Action to Case
  const handleAddAction = async (caseId: string, actionData: any) => {
    try {
      const res = await fetch(`/api/maintenance/cases/${caseId}/actions`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify(actionData)
      });
      if (res.ok) {
        // Refresh actions & case
        const actRes = await fetch(`/api/maintenance/cases/${caseId}/actions`, { headers: getAuthHeaders() });
        if (actRes.ok) {
          const acts = await actRes.json();
          setCaseActions(Array.isArray(acts) ? acts : acts.actions || []);
        }
        await fetchCases();
      }
    } catch (e) {
      console.error(e);
    }
  };

  // Verify Case
  const handleVerifyCase = async (caseId: string) => {
    try {
      const res = await fetch(`/api/maintenance/cases/${caseId}/verify`, {
        method: 'POST',
        headers: getAuthHeaders()
      });
      if (res.ok) {
        const result = await res.json();
        if (selectedCase) {
          setSelectedCase({
            ...selectedCase,
            postMaintenanceCheck: result.postMaintenanceCheck || result
          });
        }
        await fetchCases();
      }
    } catch (e) {
      console.error(e);
    }
  };

  // Close Case
  const handleCloseCase = async (caseId: string, closeData: any) => {
    try {
      const res = await fetch(`/api/maintenance/cases/${caseId}/close`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify(closeData)
      });
      if (res.ok) {
        await fetchCases();
        setSelectedCase(null);
      }
    } catch (e) {
      console.error(e);
    }
  };

  // Open Technician Matcher
  const handleOpenTechnicianMatching = async (mCase: MaintenanceCase) => {
    setMatchingCase(mCase);
    setActiveTab('MATCHING');
    setMatchLoading(true);
    try {
      const res = await fetch(`/api/maintenance/cases/${mCase.id}/match-technicians`, {
        headers: getAuthHeaders()
      });
      if (res.ok) {
        const data = await res.json();
        setTechnicians(Array.isArray(data) ? data : data.matches || data.technicians || []);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setMatchLoading(false);
    }
  };

  // Assign Technician
  const handleAssignTechnician = async (caseId: string, technicianId: string, notes?: string) => {
    try {
      const res = await fetch(`/api/maintenance/cases/${caseId}/assign`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({
          technicianId,
          notes
        })
      });
      if (res.ok) {
        await fetchCases();
        setActiveTab('CASES');
      }
    } catch (e) {
      console.error(e);
    }
  };

  // Submit Manual Case
  const handleCreateManualCase = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCaseTitle.trim()) return;
    try {
      const res = await fetch('/api/maintenance/cases', {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({
          projectId: selectedProjectId || 'default-project',
          assetId: 'ast-default',
          title: newCaseTitle,
          description: newCaseDesc,
          priority: newCasePriority
        })
      });
      if (res.ok) {
        setNewCaseTitle('');
        setNewCaseDesc('');
        setShowNewCaseModal(false);
        await fetchCases();
      }
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] font-Vazirmatn p-4 md:p-8 pb-28">
      <div className="max-w-7xl mx-auto space-y-6">
        <AdBanner />

        {/* Page Top Header */}
        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-xs font-semibold text-blue-600 bg-blue-50 px-3 py-1 rounded-full w-fit mb-2">
              <Settings size={14} />
              سامانه جامع پایش، هشدار و مدیریت تعمیرات (O&M)
            </div>
            <h1 className="text-2xl font-black text-slate-900 flex items-center gap-2">
              مدیریت هوشمند عملیات و نگهداری نیروگاه
            </h1>
            <p className="text-xs text-slate-500 mt-1">
              تبدیل داده‌های تله‌متری و انحراف عملکرد به هشدار، ریشه‌یابی فنی، پرونده تعمیراتی و اعزام تکنسین
            </p>
          </div>

          {/* Project Switcher */}
          {projects.length > 0 && (
            <div className="flex items-center gap-2 bg-slate-50 p-2 rounded-2xl border border-slate-200">
              <Building size={16} className="text-slate-400 mr-1" />
              <span className="text-xs font-bold text-slate-600">پروژه:</span>
              <select
                value={selectedProjectId}
                onChange={e => handleProjectChange(e.target.value)}
                className="text-xs font-bold bg-white border border-slate-200 rounded-xl px-3 py-1.5 text-slate-800 outline-none focus:ring-2 focus:ring-blue-500"
              >
                {projects.map(p => (
                  <option key={p.id} value={p.id}>
                    {p.title || p.projectCode || p.id}
                  </option>
                ))}
              </select>
            </div>
          )}
        </div>

        {/* Navigation Tabs */}
        <div className="flex flex-wrap border-b border-slate-200 bg-white px-4 rounded-2xl shadow-sm gap-2 text-xs font-bold text-slate-600">
          <button
            onClick={() => setActiveTab('ALERTS')}
            className={`py-3.5 px-4 border-b-2 transition-all flex items-center gap-2 ${
              activeTab === 'ALERTS'
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent hover:text-slate-900'
            }`}
          >
            <AlertTriangle size={16} />
            داشبورد هشدارها ({alerts.filter(a => a.status === 'TRIGGERED' || a.status === 'ACKNOWLEDGED').length})
          </button>

          <button
            onClick={() => setActiveTab('DIAGNOSIS')}
            className={`py-3.5 px-4 border-b-2 transition-all flex items-center gap-2 ${
              activeTab === 'DIAGNOSIS'
                ? 'border-indigo-600 text-indigo-600'
                : 'border-transparent hover:text-slate-900'
            }`}
          >
            <Stethoscope size={16} />
            تشخیص و ریشه‌یابی فنی
          </button>

          <button
            onClick={() => setActiveTab('CASES')}
            className={`py-3.5 px-4 border-b-2 transition-all flex items-center gap-2 ${
              activeTab === 'CASES'
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent hover:text-slate-900'
            }`}
          >
            <FileText size={16} />
            پرونده‌های تعمیراتی ({cases.filter(c => c.status !== 'CLOSED').length})
          </button>

          <button
            onClick={() => setActiveTab('MATCHING')}
            className={`py-3.5 px-4 border-b-2 transition-all flex items-center gap-2 ${
              activeTab === 'MATCHING'
                ? 'border-purple-600 text-purple-600'
                : 'border-transparent hover:text-slate-900'
            }`}
          >
            <UserPlus size={16} />
            تطبیق و ارجاع به تکنسین
          </button>

          <button
            onClick={() => setActiveTab('HISTORY')}
            className={`py-3.5 px-4 border-b-2 transition-all flex items-center gap-2 ${
              activeTab === 'HISTORY'
                ? 'border-emerald-600 text-emerald-600'
                : 'border-transparent hover:text-slate-900'
            }`}
          >
            <History size={16} />
            تاریخچه و شاخص‌های O&M
          </button>

          <button
            onClick={() => setActiveTab('CALCULATOR')}
            className={`py-3.5 px-4 border-b-2 transition-all flex items-center gap-2 ${
              activeTab === 'CALCULATOR'
                ? 'border-amber-600 text-amber-600'
                : 'border-transparent hover:text-slate-900'
            }`}
          >
            <Calculator size={16} />
            محاسبه‌گر توازن انرژی
          </button>
        </div>

        {/* Tab 1: Alert Dashboard */}
        {activeTab === 'ALERTS' && (
          <AlertDashboard
            alerts={alerts}
            loading={loading}
            selectedAlert={selectedAlert}
            onSelectAlert={alert => setSelectedAlert(alert)}
            onAcknowledge={handleAcknowledgeAlert}
            onDismiss={handleDismissAlert}
            onDiagnose={handleDiagnoseAlert}
            onCreateCase={handleCreateCaseFromAlert}
            onRefresh={() => fetchAlerts()}
          />
        )}

        {/* Tab 2: Diagnosis & Warranty View */}
        {activeTab === 'DIAGNOSIS' && (
          <DiagnosisView
            selectedAlert={selectedAlert}
            diagnosis={currentDiagnosis}
            loading={diagLoading}
            onRunDiagnosis={alertId => {
              if (selectedAlert) handleDiagnoseAlert(selectedAlert);
            }}
            onCreateCaseFromDiagnosis={handleCreateCaseFromDiagnosis}
            onBackToAlerts={() => setActiveTab('ALERTS')}
          />
        )}

        {/* Tab 3: Case List */}
        {activeTab === 'CASES' && (
          <CaseList
            cases={cases}
            loading={loading}
            onSelectCase={handleSelectCase}
            onAssignTechnician={handleOpenTechnicianMatching}
            onNewCase={() => setShowNewCaseModal(true)}
          />
        )}

        {/* Tab 4: Technician Matching */}
        {activeTab === 'MATCHING' && (
          <TechnicianMatcher
            mCase={matchingCase}
            technicians={technicians}
            loading={matchLoading}
            onAssign={handleAssignTechnician}
            onClose={() => setActiveTab('CASES')}
          />
        )}

        {/* Tab 5: Maintenance History & KPIs */}
        {activeTab === 'HISTORY' && (
          <MaintenanceHistory
            cases={cases}
            historyLogs={assignmentHistories}
            loading={loading}
          />
        )}

        {/* Tab 6: Power Balance Calculator (Preserved) */}
        {activeTab === 'CALCULATOR' && (
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 space-y-6">
            <h2 className="text-lg font-bold text-slate-900">ماشین‌حساب توازن انرژی مصرف و تولید</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-2">توان تولیدی (وات)</label>
                <input
                  type="number"
                  value={generation}
                  onChange={e => setGeneration(Number(e.target.value))}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm font-mono"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-2">توان مصرفی (وات)</label>
                <input
                  type="number"
                  value={consumption}
                  onChange={e => setConsumption(Number(e.target.value))}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm font-mono"
                />
              </div>
            </div>

            <div
              className={`p-4 rounded-xl flex items-center justify-between ${
                generation - consumption > 0
                  ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                  : 'bg-amber-50 text-amber-800 border border-amber-200'
              }`}
            >
              <span className="font-bold text-xs">وضعیت توازن توان لحظه‌ای:</span>
              <span className="font-black text-sm">
                {generation - consumption > 0 ? 'مازاد تولید (تزریق به باتری یا شبکه)' : 'کسری تولید (نیاز به مصرف از شبکه)'}
              </span>
            </div>
          </div>
        )}

        {/* Modal: Case Details & Actions */}
        {selectedCase && (
          <CaseDetailModal
            mCase={selectedCase}
            actions={caseActions}
            loading={modalLoading}
            onClose={() => setSelectedCase(null)}
            onAddAction={handleAddAction}
            onVerifyCase={handleVerifyCase}
            onCloseCase={handleCloseCase}
            onRefresh={() => fetchCases()}
          />
        )}

        {/* Modal: Create Manual Maintenance Case */}
        {showNewCaseModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
            <div className="bg-white w-full max-w-lg rounded-3xl border border-slate-200 shadow-2xl p-6 space-y-4">
              <h3 className="text-base font-bold text-slate-900">ثبت پرونده تعمیراتی دستی جدید</h3>
              <form onSubmit={handleCreateManualCase} className="space-y-4 text-xs">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">عنوان پرونده خرابی یا سرویس:</label>
                  <input
                    required
                    type="text"
                    placeholder="مثال: بازرسی دوره‌ای تابلو اینورتر یا افت ولتاژ استرینگ ۲"
                    value={newCaseTitle}
                    onChange={e => setNewCaseTitle(e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-slate-300 bg-white"
                  />
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">اولویت رسیدگی:</label>
                  <select
                    value={newCasePriority}
                    onChange={e => setNewCasePriority(e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-slate-300 bg-white"
                  >
                    <option value="LOW">عادی (Low)</option>
                    <option value="MEDIUM">متوسط (Medium)</option>
                    <option value="HIGH">بالا (High)</option>
                    <option value="URGENT">فوری و بحرانی (Urgent)</option>
                  </select>
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">شرح جزئیات ایراد:</label>
                  <textarea
                    value={newCaseDesc}
                    onChange={e => setNewCaseDesc(e.target.value)}
                    placeholder="توضیحات تکمیلی پیرامون محل وقوع، تجهیز، نشانه..."
                    className="w-full p-2.5 rounded-xl border border-slate-300 bg-white h-20 resize-none"
                  />
                </div>

                <div className="flex justify-end gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setShowNewCaseModal(false)}
                    className="px-4 py-2 font-medium text-slate-600 hover:text-slate-900"
                  >
                    انصراف
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-xl transition-all shadow-sm"
                  >
                    ثبت پرونده
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
