import React, { useState, useEffect } from 'react';
import {
  FileText,
  Clock,
  CheckCircle2,
  AlertTriangle,
  UserCheck,
  Phone,
  Wrench,
  Layers,
  ArrowRight,
  ShieldCheck,
  ShieldAlert,
  Info,
  ExternalLink,
  Loader2,
  Calendar,
  Check
} from 'lucide-react';
import { MaintenanceCase, MaintenanceAction } from '../../types/maintenance';
import { Link } from 'react-router-dom';

interface CustomerCaseTrackingProps {
  caseId: string;
  onBack: () => void;
  onCaseUpdated?: (updated: MaintenanceCase) => void;
}

export const CustomerCaseTracking: React.FC<CustomerCaseTrackingProps> = ({
  caseId,
  onBack,
  onCaseUpdated
}) => {
  const [mCase, setMCase] = useState<MaintenanceCase | null>(null);
  const [actions, setActions] = useState<MaintenanceAction[]>([]);
  const [loading, setLoading] = useState(true);
  const [closing, setClosing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [closeSuccess, setCloseSuccess] = useState(false);

  const getAuthHeaders = () => {
    const token = localStorage.getItem('token');
    return {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {})
    };
  };

  useEffect(() => {
    fetchCaseDetails();
  }, [caseId]);

  const fetchCaseDetails = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/maintenance/${caseId}`, {
        headers: getAuthHeaders()
      });
      if (!res.ok) {
        throw new Error('پرونده تعمیراتی یافت نشد یا دسترسی مجاز نیست.');
      }
      const data = await res.json();
      setMCase(data);
      if (Array.isArray(data.actions)) {
        setActions(data.actions);
      } else {
        // fetch actions separately if needed
        const actRes = await fetch(`/api/maintenance/${caseId}/actions`, { headers: getAuthHeaders() });
        if (actRes.ok) {
          const actData = await actRes.json();
          setActions(Array.isArray(actData) ? actData : []);
        }
      }
    } catch (e: any) {
      setError(e?.message || 'خطا در بارگذاری پرونده تعمیراتی');
    } finally {
      setLoading(false);
    }
  };

  const handleCloseCase = async () => {
    if (!mCase) return;
    setClosing(true);
    try {
      const res = await fetch(`/api/maintenance/${mCase.id}/close`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({
          closureNotes: 'تأیید رضایت مشتری و بستن نهایی پرونده'
        })
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || 'خطا در بستن پرونده');
      }
      const updated = await res.json();
      setMCase(updated);
      setCloseSuccess(true);
      if (onCaseUpdated) {
        onCaseUpdated(updated);
      }
    } catch (e: any) {
      setError(e?.message || 'خطا در بستن پرونده');
    } finally {
      setClosing(false);
    }
  };

  if (loading) {
    return (
      <div className="py-20 text-center space-y-3 bg-white rounded-3xl border border-slate-200">
        <Loader2 className="w-8 h-8 text-blue-600 animate-spin mx-auto" />
        <p className="text-xs font-bold text-slate-700">در حال دریافت آخرین وضعیت پرونده و گزارش اقدامات...</p>
      </div>
    );
  }

  if (error || !mCase) {
    return (
      <div className="bg-white rounded-3xl border border-slate-200 p-8 text-center space-y-4">
        <AlertTriangle size={36} className="text-rose-500 mx-auto" />
        <h3 className="text-base font-bold text-slate-900">عدم دسترسی یا عدم وجود پرونده</h3>
        <p className="text-xs text-slate-500 max-w-md mx-auto">{error || 'پرونده مورد نظر یافت نشد.'}</p>
        <button
          onClick={onBack}
          className="px-5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl"
        >
          بازگشت به فهرست پرونده‌ها
        </button>
      </div>
    );
  }

  // Lifecycle steps calculation
  const statusLevels: Record<string, number> = {
    REPORTED: 1,
    OPEN: 1,
    ASSIGNED: 2,
    SCHEDULED: 2,
    IN_PROGRESS: 3,
    PENDING_VERIFICATION: 4,
    AWAITING_VERIFICATION: 4,
    VERIFIED: 4,
    COMPLETED: 5,
    RESOLVED: 5,
    CLOSED: 5
  };
  const currentLevel = statusLevels[mCase.status] || 1;

  const stepsDef = [
    { level: 1, label: 'ثبت و ارزیابی' },
    { level: 2, label: 'تخصیص متخصص' },
    { level: 3, label: 'اقدامات سرویس' },
    { level: 4, label: 'بررسی و تایید' },
    { level: 5, label: 'تکمیل و بایگانی' }
  ];

  return (
    <div className="space-y-6">
      {/* Top Navigation */}
      <div className="flex items-center justify-between">
        <button
          onClick={onBack}
          className="text-xs font-bold text-slate-600 hover:text-slate-900 flex items-center gap-1.5 transition-colors"
        >
          <ArrowRight size={16} />
          <span>بازگشت به فهرست پرونده‌ها</span>
        </button>

        <div className="flex items-center gap-2">
          <span className="text-xs text-slate-400">کد پیگیری:</span>
          <span className="font-mono text-xs font-black text-blue-700 bg-blue-50 px-2.5 py-1 rounded-lg border border-blue-200">
            {mCase.caseNumber || mCase.maintenanceCode || mCase.id}
          </span>
        </div>
      </div>

      {/* Main Status & Header Card */}
      <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200 pb-5">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200">
                {mCase.status === 'CLOSED' ? 'تکمیل و بایگانی‌شده' : mCase.status === 'IN_PROGRESS' ? 'در حال سرویس و اقدام' : mCase.status === 'ASSIGNED' ? 'تخصیص‌یافته به متخصص' : 'ثبت‌شده در صف بررسی'}
              </span>
              <span className="text-xs text-slate-400">
                تاریخ ثبت: {new Date(mCase.createdAt || mCase.reportedAt).toLocaleDateString('fa-IR')}
              </span>
            </div>
            <h1 className="text-xl font-black text-slate-900">{mCase.title}</h1>
            <p className="text-xs text-slate-500 mt-1">{mCase.description}</p>
          </div>

          {/* Quick Actions */}
          <div className="flex items-center gap-2 shrink-0">
            {mCase.status !== 'CLOSED' && (
              <button
                type="button"
                disabled={closing}
                onClick={handleCloseCase}
                className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl transition-all shadow-sm flex items-center gap-1.5"
              >
                {closing ? <Loader2 size={14} className="animate-spin" /> : <CheckCircle2 size={14} />}
                <span>تأیید و تحویل نهایی (بستن پرونده)</span>
              </button>
            )}
          </div>
        </div>

        {closeSuccess && (
          <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-800 flex items-center gap-2">
            <CheckCircle2 size={16} className="text-emerald-600" />
            <span>پرونده با موفقیت بسته شد و سوابق آن در تاریخچه دارایی ذخیره گردید.</span>
          </div>
        )}

        {/* 5-Step Progress Stepper */}
        <div className="space-y-3">
          <span className="text-xs font-bold text-slate-700 block">گردش کار و وضعیت پیشرفت رسیدگی:</span>
          <div className="grid grid-cols-5 gap-2">
            {stepsDef.map(s => {
              const isPast = s.level < currentLevel;
              const isCurrent = s.level === currentLevel;
              return (
                <div key={s.level} className="text-center space-y-1.5">
                  <div
                    className={`h-2 rounded-full transition-all ${
                      isPast
                        ? 'bg-emerald-500'
                        : isCurrent
                          ? 'bg-blue-600 ring-2 ring-blue-300'
                          : 'bg-slate-200'
                    }`}
                  />
                  <span
                    className={`text-[11px] block font-bold truncate ${
                      isCurrent ? 'text-blue-700' : isPast ? 'text-emerald-700' : 'text-slate-400'
                    }`}
                  >
                    {s.label}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Grid: Technician & Details */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Column 1: Assigned Technician */}
        <div className="bg-white rounded-3xl border border-slate-200 p-5 shadow-sm space-y-4">
          <h3 className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
            <UserCheck size={16} className="text-blue-600" />
            <span>متخصص O&M مسئول پرونده</span>
          </h3>

          {mCase.assignedTechnicianName ? (
            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-3 text-xs">
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center font-bold text-sm">
                  {mCase.assignedTechnicianName.substring(0, 1)}
                </div>
                <div>
                  <div className="font-bold text-slate-900 flex items-center gap-1">
                    <span>{mCase.assignedTechnicianName}</span>
                    <ShieldCheck size={14} className="text-emerald-600" />
                  </div>
                  <span className="text-[11px] text-slate-400">متخصص دارای پروانه صلاحیت فنی</span>
                </div>
              </div>

              {mCase.assignedTechnicianPhone ? (
                <div className="pt-2 border-t border-slate-200 flex items-center justify-between">
                  <span className="text-slate-500">شماره تماس مستقیم:</span>
                  <a
                    href={`tel:${mCase.assignedTechnicianPhone}`}
                    className="font-mono font-bold text-blue-600 hover:text-blue-700 flex items-center gap-1"
                  >
                    <Phone size={12} />
                    <span>{mCase.assignedTechnicianPhone}</span>
                  </a>
                </div>
              ) : (
                <div className="pt-2 border-t border-slate-200 text-slate-400 text-[11px]">
                  هماهنگی بازدید از طریق مرکز پشتیبانی هوشیار انجام می‌شود.
                </div>
              )}

              {mCase.assignedTechnicianId && (
                <div className="pt-2">
                  <Link
                    to={`/professionals/${mCase.assignedTechnicianId}`}
                    className="w-full py-2 bg-white hover:bg-slate-100 text-slate-700 border border-slate-200 rounded-xl font-bold text-center block transition-colors"
                  >
                    مشاهده پروفایل و سوابق متخصص
                  </Link>
                </div>
              )}
            </div>
          ) : (
            <div className="p-4 bg-slate-50 rounded-2xl border border-dashed border-slate-200 text-center text-xs text-slate-400">
              تکنسین تخصیص داده نشده است.
              <p className="text-[10px] text-slate-400 mt-1">پرونده در صف ارجاع و انطباق قرار دارد.</p>
            </div>
          )}

          {/* Asset Passport Link Notice */}
          {mCase.assetId && mCase.assetId !== 'UNREGISTERED' && (
            <div className="p-3.5 bg-blue-50/60 rounded-2xl border border-blue-200 space-y-2 text-xs">
              <div className="flex items-center gap-1.5 text-blue-900 font-bold">
                <Info size={14} className="text-blue-600 shrink-0" />
                <span>اتصال به شناسنامه دارایی (Asset Passport)</span>
              </div>
              <p className="text-[11px] text-blue-800">
                این پرونده به دارایی انرژی متصل است. سوابق اقدامات و قطعات مصرفی به دفترچه شناسنامه اضافه خواهد شد.
              </p>
              <Link
                to={`/solar-assets/${mCase.assetId}`}
                className="text-[11px] font-bold text-blue-700 hover:underline flex items-center gap-1 pt-1"
              >
                <span>مشاهده شناسنامه فنی دارایی</span>
                <ExternalLink size={12} />
              </Link>
            </div>
          )}
        </div>

        {/* Column 2 & 3: Actions Timeline & Service Log */}
        <div className="md:col-span-2 bg-white rounded-3xl border border-slate-200 p-5 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
              <Wrench size={16} className="text-blue-600" />
              <span>لاگ و سوابق اقدامات فنی ثبت‌شده ({actions.length})</span>
            </h3>
            <span className="text-[11px] text-slate-400">ثبت‌شده توسط متخصص اعزامی</span>
          </div>

          {actions.length === 0 ? (
            <div className="p-8 text-center bg-slate-50 rounded-2xl border border-dashed border-slate-200 text-xs text-slate-400 space-y-1">
              <Clock size={24} className="mx-auto text-slate-300 mb-2" />
              <p className="font-bold text-slate-600">هنوز اقدام فنی ثبت نشده است.</p>
              <p className="text-[11px]">با شروع بازرسی میدانی یا تست تجهیز، گزارش‌ها در این بخش درج می‌گردد.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {actions.map((act, idx) => (
                <div key={act.id || idx} className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200 space-y-2 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-slate-800">{act.description}</span>
                    <span className="text-[10px] font-mono text-slate-400">
                      {new Date(act.performedAt || (act as any).createdAt).toLocaleDateString('fa-IR')}
                    </span>
                  </div>

                  <div className="flex flex-wrap items-center gap-3 text-[11px] text-slate-500 pt-1 border-t border-slate-200">
                    <span>نوع اقدام: <strong className="text-slate-700">{act.actionType}</strong></span>
                    {act.resultStatus && (
                      <span>نتیجه: <strong className="text-emerald-700">{act.resultStatus === 'SUCCESS' ? 'موفق' : act.resultStatus}</strong></span>
                    )}
                    {act.newComponentSerial && (
                      <span className="font-mono">سریال قطعه جدید: {act.newComponentSerial}</span>
                    )}
                  </div>

                  {act.notes && (
                    <p className="text-[11px] text-slate-600 bg-white p-2 rounded-xl border border-slate-200">
                      {act.notes}
                    </p>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
