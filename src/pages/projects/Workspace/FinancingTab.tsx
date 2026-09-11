import React, { useState, useEffect } from 'react';
import { 
  Building2, 
  ShieldCheck, 
  Coins, 
  CheckCircle2, 
  AlertCircle, 
  ChevronRight, 
  FileText, 
  ArrowUpRight, 
  RefreshCw, 
  Plus, 
  SlidersHorizontal,
  Clock, 
  Send, 
  Percent, 
  Lock, 
  FileSearch, 
  Layers, 
  HelpCircle,
  BarChart3,
  Calendar
} from 'lucide-react';
import { EnergyProject } from '../../../types/project';
import { 
  FinancingRequest, 
  FinanceReadinessSnapshot, 
  FinancialPartnerProfile, 
  FinancingOffer, 
  ProjectFinancingRecord 
} from '../../../types/financing';
import { OfferComparisonSummary } from '../../../services/financingOfferComparisonService';
import { DebtSchedulePeriod } from '../../../services/debtServiceCalculator';

interface FinancingTabProps {
  projectId: string;
  project: EnergyProject;
}

export const FinancingTab: React.FC<FinancingTabProps> = ({ projectId, project }) => {
  const [loading, setLoading] = useState(true);
  const [activeSubTab, setActiveSubTab] = useState<'overview' | 'matches' | 'offers' | 'partner_console' | 'amortization'>('overview');
  
  const [financingRequests, setFinancingRequests] = useState<FinancingRequest[]>([]);
  const [activeRequest, setActiveRequest] = useState<FinancingRequest | null>(null);
  const [readinessSnapshot, setReadinessSnapshot] = useState<FinanceReadinessSnapshot | null>(null);
  const [matchedPartners, setMatchedPartners] = useState<any[]>([]);
  const [offers, setOffers] = useState<FinancingOffer[]>([]);
  const [offerComparisons, setOfferComparisons] = useState<OfferComparisonSummary[]>([]);
  const [financingRecord, setFinancingRecord] = useState<ProjectFinancingRecord | null>(null);

  // Modals & form state
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [submittingToPartner, setSubmittingToPartner] = useState<string | null>(null);
  const [showOfferModal, setShowOfferModal] = useState(false);
  const [showInfoRequestModal, setShowInfoRequestModal] = useState(false);

  // Create form state
  const [reqForm, setReqForm] = useState({
    requestedAmountTomans: 600, // in Million Tomans
    totalProjectCostTomans: 1000,
    ownerEquityTomans: 300,
    financingType: 'PROJECT_LOAN',
    requestedTenorMonths: 48,
    preferredGracePeriodMonths: 6,
    repaymentPreference: 'EQUAL_INSTALLMENT',
    projectRevenueModel: 'PPA',
    collateralAvailable: true,
    collateralSummary: 'سند ملکی شش‌دانگ و توثیق قرارداد خرید تضمینی ساتبا',
    summary: 'درخواست تسهیلات جهت احداث نیروگاه خورشیدی'
  });

  // Partner new offer form state
  const [newOfferForm, setNewOfferForm] = useState({
    offeredAmountTomans: 600,
    interestRate: 23,
    tenorMonths: 48,
    gracePeriodMonths: 6,
    repaymentType: 'EQUAL_INSTALLMENT',
    partnerId: 'fp-tejarat-energy',
    collateralText: 'توثیق رسمی ملک و سفته ضامنین',
    conditionsText: 'ارائه تاییدیه اتصال به شبکه و قرارداد EPC معتبر',
    notes: 'پیشنهاد مصوب تسهیلات با دوره تنفس ۶ ماهه'
  });

  // Info request form
  const [infoReqForm, setInfoReqForm] = useState({
    title: 'درخواست تاییدیه رسمی اتصال به شبکه و گزارش ارزیابی فنی',
    description: 'لطفاً آخرین نسخه دیاگرام تک‌خطی مورد تایید شرکت توزیع نیروی برق بارگذاری گردد.',
    documentTypes: 'مجوز اتصال به شبکه, دیاگرام SLD'
  });

  // Fetch all financing data
  const fetchData = async () => {
    setLoading(true);
    try {
      // 1. Get financing requests for project
      const reqRes = await fetch(`/api/projects/${projectId}/financing-requests`);
      if (reqRes.ok) {
        const reqs: FinancingRequest[] = await reqRes.json();
        setFinancingRequests(reqs);
        
        if (reqs.length > 0) {
          const current = reqs[0];
          setActiveRequest(current);

          // Fetch readiness
          const readyRes = await fetch(`/api/financing-requests/${current.id}`);
          if (readyRes.ok) {
            const data = await readyRes.json();
            if (data.latestReadiness) {
              setReadinessSnapshot(data.latestReadiness);
            }
          }

          // Fetch matches
          const matchRes = await fetch(`/api/financing-requests/${current.id}/matches`);
          if (matchRes.ok) {
            const matchesData = await matchRes.json();
            setMatchedPartners(matchesData);
          }

          // Fetch offers & comparisons
          const compRes = await fetch(`/api/financing-requests/${current.id}/compare-offers`);
          if (compRes.ok) {
            const compData = await compRes.json();
            setOfferComparisons(compData);
            setOffers(compData.map((c: any) => c.offer));
          }
        }
      }

      // 2. Get active project financing record
      const finRecRes = await fetch(`/api/projects/${projectId}/financing`);
      if (finRecRes.ok) {
        const finRecData = await finRecRes.json();
        if (finRecData.activeRecord) {
          setFinancingRecord(finRecData.activeRecord);
        }
      }
    } catch (err) {
      console.error('Error fetching financing data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [projectId]);

  // Handle create financing request
  const handleCreateRequest = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch(`/api/projects/${projectId}/financing-requests`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          requestedAmount: reqForm.requestedAmountTomans * 10000000,
          totalProjectCost: reqForm.totalProjectCostTomans * 10000000,
          ownerEquity: reqForm.ownerEquityTomans * 10000000,
          financingType: reqForm.financingType,
          requestedTenorMonths: Number(reqForm.requestedTenorMonths),
          preferredGracePeriodMonths: Number(reqForm.preferredGracePeriodMonths),
          repaymentPreference: reqForm.repaymentPreference,
          projectRevenueModel: reqForm.projectRevenueModel,
          collateralAvailable: reqForm.collateralAvailable,
          collateralSummary: reqForm.collateralSummary,
          summary: reqForm.summary
        })
      });
      if (res.ok) {
        setShowCreateModal(false);
        await fetchData();
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // Re-evaluate readiness
  const handleRefreshReadiness = async () => {
    if (!activeRequest) return;
    setLoading(true);
    try {
      const res = await fetch(`/api/financing-requests/${activeRequest.id}/readiness`, { method: 'POST' });
      if (res.ok) {
        const snapshot = await res.json();
        setReadinessSnapshot(snapshot);
        // refresh matches too
        const matchRes = await fetch(`/api/financing-requests/${activeRequest.id}/matches`);
        if (matchRes.ok) {
          setMatchedPartners(await matchRes.json());
        }
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // Submit to partner
  const handleSubmitToPartner = async (partnerId: string) => {
    if (!activeRequest) return;
    setSubmittingToPartner(partnerId);
    try {
      const res = await fetch(`/api/financing-requests/${activeRequest.id}/submit-to-partner`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          financialPartnerProfileId: partnerId,
          message: `ارسال پرونده تأمین مالی پروژه خورشیدی ${project.title} جهت بررسی اعتباری`
        })
      });
      if (res.ok) {
        await fetchData();
        setActiveSubTab('partner_console');
      }
    } catch (err) {
      console.error(err);
    } finally {
      setSubmittingToPartner(null);
    }
  };

  // Select offer
  const handleSelectOffer = async (offerId: string) => {
    try {
      const res = await fetch(`/api/financing-offers/${offerId}/select`, { method: 'POST' });
      if (res.ok) {
        await fetchData();
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Record partner approval
  const handleRecordPartnerApproval = async (offerId: string) => {
    try {
      const res = await fetch(`/api/financing-offers/${offerId}/record-partner-approval`, { method: 'POST' });
      if (res.ok) {
        await fetchData();
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Partner submit offer
  const handlePartnerSubmitOffer = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeRequest) return;
    try {
      const subRes = await fetch('/api/financial-partners/requests');
      const subs = await subRes.json();
      const currentSub = subs.find((s: any) => s.request?.id === activeRequest.id) || { submission: { id: 'temp-sub' } };

      const res = await fetch(`/api/financial-partners/requests/${currentSub.submission.id}/offers`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          offeredAmount: newOfferForm.offeredAmountTomans * 10000000,
          interestRate: Number(newOfferForm.interestRate),
          tenorMonths: Number(newOfferForm.tenorMonths),
          gracePeriodMonths: Number(newOfferForm.gracePeriodMonths),
          repaymentType: newOfferForm.repaymentType,
          collateralRequirements: [newOfferForm.collateralText],
          conditionsPrecedent: [newOfferForm.conditionsText],
          notes: newOfferForm.notes
        })
      });

      if (res.ok) {
        setShowOfferModal(false);
        await fetchData();
        setActiveSubTab('offers');
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Format money
  const formatToman = (rials: number) => {
    return (Math.round(rials / 10000000)).toLocaleString('fa-IR') + ' میلیون تومان';
  };

  if (loading && !activeRequest) {
    return (
      <div className="bg-white p-12 rounded-2xl border border-gray-200 text-center">
        <RefreshCw className="w-8 h-8 text-blue-600 animate-spin mx-auto mb-4" />
        <p className="text-gray-600 font-medium">در حال بارگذاری اطلاعات ماژول تأمین مالی هوشیار...</p>
      </div>
    );
  }

  // Active or derived stats
  const totalCost = activeRequest?.totalProjectCost || (project.estimatedBudgetIRR || 10000000000);
  const ownerEquity = activeRequest?.ownerEquity || Math.round(totalCost * 0.3);
  const fundingGap = activeRequest?.fundingGap || Math.max(0, totalCost - ownerEquity);
  const readinessScore = readinessSnapshot?.totalScore || activeRequest?.readinessScore || 0;

  return (
    <div className="space-y-6">
      {/* 1. Header Summary Banner */}
      <div className="bg-gradient-to-br from-slate-900 via-slate-800 to-indigo-950 p-6 rounded-2xl border border-slate-700 shadow-xl text-white">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-slate-700/80 pb-6 mb-6">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                فاز ۸: مارکت‌پلیس و فرآیند تأمین مالی
              </span>
              <span className="text-xs text-slate-400">Hooshyar Energy Project Finance</span>
            </div>
            <h2 className="text-2xl font-bold tracking-tight">میز مدیریت تأمین مالی و تسهیلات اعتباری</h2>
            <p className="text-sm text-slate-300 mt-1">
              اتصال هوشمند پروژه به بانک‌ها، صندوق‌های سبز و شرکت‌های لیزینگ جهت پوشش کسری سرمایه
            </p>
          </div>

          <div className="flex items-center gap-3">
            {activeRequest ? (
              <button
                onClick={handleRefreshReadiness}
                className="flex items-center gap-2 px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 text-sm font-medium rounded-xl border border-slate-600 transition"
              >
                <RefreshCw size={16} />
                ارزیابی مجدد شاخص آمادگی
              </button>
            ) : (
              <button
                onClick={() => setShowCreateModal(true)}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white text-sm font-semibold rounded-xl shadow-lg shadow-blue-600/30 transition"
              >
                <Plus size={18} />
                ایجاد پرونده تأمین مالی
              </button>
            )}
          </div>
        </div>

        {/* 4 Key Metrics */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white/5 border border-white/10 p-4 rounded-xl backdrop-blur-sm">
            <div className="text-xs text-slate-400 mb-1 flex items-center gap-1.5">
              <Coins size={14} className="text-blue-400" />
              کل هزینه پروژه (CAPEX)
            </div>
            <div className="text-xl font-black text-white">{formatToman(totalCost)}</div>
            <div className="text-xs text-slate-400 mt-1">برآورد مهندسی و مدل مالی</div>
          </div>

          <div className="bg-white/5 border border-white/10 p-4 rounded-xl backdrop-blur-sm">
            <div className="text-xs text-slate-400 mb-1 flex items-center gap-1.5">
              <ShieldCheck size={14} className="text-indigo-400" />
              آورده کارفرما (Equity)
            </div>
            <div className="text-xl font-black text-white">{formatToman(ownerEquity)}</div>
            <div className="text-xs text-emerald-400 mt-1 font-semibold">
              {((ownerEquity / (totalCost || 1)) * 100).toFixed(0)}٪ از کل سرمایه
            </div>
          </div>

          <div className="bg-white/5 border border-white/10 p-4 rounded-xl backdrop-blur-sm">
            <div className="text-xs text-slate-400 mb-1 flex items-center gap-1.5">
              <AlertCircle size={14} className="text-amber-400" />
              کسری تأمین مالی (Funding Gap)
            </div>
            <div className="text-xl font-black text-amber-300">{formatToman(fundingGap)}</div>
            <div className="text-xs text-slate-400 mt-1">مبلغ موردنیاز تسهیلات / وام</div>
          </div>

          <div className="bg-white/5 border border-white/10 p-4 rounded-xl backdrop-blur-sm">
            <div className="text-xs text-slate-400 mb-1 flex items-center gap-1.5">
              <BarChart3 size={14} className="text-emerald-400" />
              شاخص آمادگی بانکی (Readiness)
            </div>
            <div className="flex items-center gap-2">
              <div className="text-2xl font-black text-emerald-400">{readinessScore}</div>
              <span className="text-xs text-slate-400">/ ۱۰۰</span>
            </div>
            <div className="w-full bg-slate-700/60 rounded-full h-1.5 mt-2 overflow-hidden">
              <div 
                className={`h-1.5 rounded-full ${readinessScore >= 70 ? 'bg-emerald-400' : readinessScore >= 50 ? 'bg-amber-400' : 'bg-red-400'}`} 
                style={{ width: `${readinessScore}%` }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* 2. Sub-Tabs Navigation */}
      <div className="flex border-b border-gray-200 bg-white px-4 rounded-xl shadow-sm gap-2">
        <button
          onClick={() => setActiveSubTab('overview')}
          className={`py-3.5 px-4 font-bold text-sm border-b-2 flex items-center gap-2 transition ${
            activeSubTab === 'overview'
              ? 'border-blue-600 text-blue-600'
              : 'border-transparent text-gray-500 hover:text-gray-700'
          }`}
        >
          <FileText size={16} />
          پرونده و ارزیابی آمادگی (Readiness)
        </button>

        <button
          onClick={() => setActiveSubTab('matches')}
          className={`py-3.5 px-4 font-bold text-sm border-b-2 flex items-center gap-2 transition ${
            activeSubTab === 'matches'
              ? 'border-blue-600 text-blue-600'
              : 'border-transparent text-gray-500 hover:text-gray-700'
          }`}
        >
          <Building2 size={16} />
          شرکای مالی منطبق ({matchedPartners.length})
        </button>

        <button
          onClick={() => setActiveSubTab('offers')}
          className={`py-3.5 px-4 font-bold text-sm border-b-2 flex items-center gap-2 transition ${
            activeSubTab === 'offers'
              ? 'border-blue-600 text-blue-600'
              : 'border-transparent text-gray-500 hover:text-gray-700'
          }`}
        >
          <Percent size={16} />
          مقایسه و انتخاب پیشنهادات ({offers.length})
        </button>

        <button
          onClick={() => setActiveSubTab('partner_console')}
          className={`py-3.5 px-4 font-bold text-sm border-b-2 flex items-center gap-2 transition ${
            activeSubTab === 'partner_console'
              ? 'border-blue-600 text-blue-600'
              : 'border-transparent text-gray-500 hover:text-gray-700'
          }`}
        >
          <SlidersHorizontal size={16} />
          پنل بررسی نهاد مالی (Demo Workflow)
        </button>

        {financingRecord && (
          <button
            onClick={() => setActiveSubTab('amortization')}
            className={`py-3.5 px-4 font-bold text-sm border-b-2 flex items-center gap-2 transition ${
              activeSubTab === 'amortization'
                ? 'border-emerald-600 text-emerald-600'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            <CheckCircle2 size={16} className="text-emerald-500" />
            تسهیلات نهایی و جدول بازپرداخت
          </button>
        )}
      </div>

      {/* Sub-Tab 1: Overview & Readiness Breakdown */}
      {activeSubTab === 'overview' && (
        <div className="space-y-6">
          {!activeRequest ? (
            <div className="bg-white p-10 rounded-2xl border border-gray-200 text-center shadow-sm">
              <Building2 className="w-12 h-12 text-gray-400 mx-auto mb-3" />
              <h3 className="text-lg font-bold text-gray-900 mb-2">هنوز پرونده تأمین مالی ایجاد نشده است</h3>
              <p className="text-sm text-gray-500 max-w-md mx-auto mb-6">
                برای اتصال پروژه به بانک‌ها و دریافت پیشنهاد تسهیلات، ابتدا پرونده درخواست تأمین مالی را تکمیل کنید.
              </p>
              <button
                onClick={() => setShowCreateModal(true)}
                className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl shadow-md transition"
              >
                تکمیل فرم درخواست تأمین مالی
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Left Column: Request Profile Details */}
              <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm lg:col-span-1 space-y-4">
                <div className="flex justify-between items-center pb-3 border-b border-gray-100">
                  <h3 className="font-bold text-gray-900 flex items-center gap-2">
                    <FileText size={18} className="text-blue-600" />
                    مشخصات پرونده تسهیلات
                  </h3>
                  <span className="px-2.5 py-1 bg-blue-50 text-blue-700 text-xs font-bold rounded-lg">
                    {activeRequest.requestCode}
                  </span>
                </div>

                <div className="space-y-3 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-500">وضعیت فرآیند:</span>
                    <span className="font-bold text-gray-800">{activeRequest.status}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">نوع ابزار مالی:</span>
                    <span className="font-bold text-gray-800">{activeRequest.financingType}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">مبلغ درخواستی:</span>
                    <span className="font-bold text-blue-700">{formatToman(activeRequest.requestedAmount)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">دوره بازپرداخت درخواستی:</span>
                    <span className="font-bold text-gray-800">{activeRequest.requestedTenorMonths} ماه</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">تنفس ساخت درخواستی:</span>
                    <span className="font-bold text-gray-800">{activeRequest.preferredGracePeriodMonths} ماه</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">نوع بازپرداخت:</span>
                    <span className="font-bold text-gray-800">{activeRequest.repaymentPreference}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">مدل درآمدی پروژه:</span>
                    <span className="font-bold text-gray-800">{activeRequest.projectRevenueModel}</span>
                  </div>
                </div>

                <div className="pt-3 border-t border-gray-100">
                  <div className="text-xs text-gray-500 mb-1">وثایق و تضامین پیشنهادی:</div>
                  <div className="text-xs bg-gray-50 p-2.5 rounded-lg border border-gray-100 text-gray-700">
                    {activeRequest.collateralSummary || 'تضامین معتبر ملکی و اسناد بانکی'}
                  </div>
                </div>

                <button
                  onClick={() => setActiveSubTab('matches')}
                  className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm rounded-xl transition flex items-center justify-center gap-2"
                >
                  مشاهده شرکای مالی سازگار
                  <ChevronRight size={16} />
                </button>
              </div>

              {/* Right Column: 8-Dimension Finance Readiness Score */}
              <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm lg:col-span-2 space-y-6">
                <div className="flex justify-between items-start pb-4 border-b border-gray-100">
                  <div>
                    <h3 className="font-bold text-gray-900 flex items-center gap-2 text-lg">
                      <BarChart3 size={20} className="text-emerald-600" />
                      ماتریس آمادگی بانکی و پذیرش اعتباری (Finance Readiness)
                    </h3>
                    <p className="text-xs text-gray-500 mt-1">
                      ارزیابی ۸ مؤلفه اصلی بر اساس استانداردهای اعتبارسنجی شبکه بانکی و صندوق‌های تخصصی انرژی
                    </p>
                  </div>
                  <div className="text-right">
                    <span className={`px-3 py-1 text-xs font-bold rounded-full ${
                      readinessScore >= 70 ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                    }`}>
                      سطح: {readinessSnapshot?.level || 'در حال ارزیابی'}
                    </span>
                  </div>
                </div>

                {/* 8 Category Progress Grid */}
                {readinessSnapshot?.breakdown && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {Object.entries(readinessSnapshot.breakdown).map(([key, item]: [string, any]) => (
                      <div key={key} className="bg-gray-50 p-3.5 rounded-xl border border-gray-100">
                        <div className="flex justify-between items-center mb-1">
                          <span className="text-xs font-bold text-gray-700">
                            {key === 'technicalReadiness' && '۱. آمادگی فنی و مهندسی'}
                            {key === 'financialModel' && '۲. مدل مالی و امکان‌سنجی'}
                            {key === 'revenueVisibility' && '۳. قابلیت تحقق درآمد (PPA/تعرفه)'}
                            {key === 'epcContractReadiness' && '۴. قرارداد EPC و اجرا'}
                            {key === 'landSiteDocumentation' && '۵. اسناد مالکیت و زمین'}
                            {key === 'permitsGrid' && '۶. مجوز اتصال به شبکه برق'}
                            {key === 'sponsorContribution' && '۷. نسبت آورده متقاضی (Equity)'}
                            {key === 'dataRoomCompleteness' && '۸. کفایت اسناد Data Room'}
                          </span>
                          <span className="text-xs font-bold text-gray-900">
                            {item.score} / {item.max}
                          </span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-1.5 mb-2 overflow-hidden">
                          <div
                            className={`h-1.5 rounded-full ${
                              item.score === item.max ? 'bg-emerald-500' : item.score > item.max / 2 ? 'bg-blue-500' : 'bg-amber-500'
                            }`}
                            style={{ width: `${(item.score / item.max) * 100}%` }}
                          />
                        </div>
                        <p className="text-[11px] text-gray-500 leading-relaxed line-clamp-2">
                          {item.details}
                        </p>
                      </div>
                    ))}
                  </div>
                )}

                {/* Actionable Missing Requirements */}
                {readinessSnapshot?.missingRequirements && readinessSnapshot.missingRequirements.length > 0 && (
                  <div className="bg-amber-50/70 border border-amber-200/80 p-4 rounded-xl">
                    <h4 className="text-xs font-bold text-amber-900 flex items-center gap-1.5 mb-2">
                      <AlertCircle size={14} className="text-amber-700" />
                      اقدامات ضروری برای ارتقای رتبه اعتباری و تسهیل پذیرش بانک:
                    </h4>
                    <ul className="space-y-1.5 text-xs text-amber-800">
                      {readinessSnapshot.missingRequirements.map((req, idx) => (
                        <li key={idx} className="flex items-start gap-2">
                          <span className="text-amber-600 font-bold">•</span>
                          <span>{req}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Sub-Tab 2: Matched Financial Partners & Products */}
      {activeSubTab === 'matches' && (
        <div className="space-y-4">
          <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 pb-4 border-b border-gray-100">
              <div>
                <h3 className="text-lg font-bold text-gray-900">شرکای مالی واجد شرایط (Matching Engine)</h3>
                <p className="text-xs text-gray-500 mt-1">
                  الگوریتم هوشیار با بررسی مبالغ، نوع وثایق، جغرافیا، فناوری و شاخص آمادگی، مناسب‌ترین نهادها را اولویت‌بندی کرده است.
                </p>
              </div>
              <span className="px-3 py-1 bg-gray-100 text-gray-700 text-xs font-semibold rounded-lg">
                {matchedPartners.length} نهاد مالی همکار
              </span>
            </div>

            <div className="divide-y divide-gray-100 mt-4">
              {matchedPartners.map((match) => {
                const partner = match.partner as FinancialPartnerProfile;
                const product = match.product;
                const isSubmitting = submittingToPartner === partner.id;

                return (
                  <div key={match.id} className="py-5 flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
                    <div className="space-y-2 flex-1">
                      <div className="flex items-center gap-2">
                        <span className="text-base font-bold text-gray-900">{partner.displayName}</span>
                        {partner.isDemo && (
                          <span className="px-2 py-0.5 bg-amber-50 text-amber-700 border border-amber-200 text-[10px] font-bold rounded">
                            دمو / فعال
                          </span>
                        )}
                        <span className={`px-2.5 py-0.5 text-[11px] font-bold rounded-full ${
                          match.eligibilityStatus === 'ELIGIBLE' 
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' 
                            : 'bg-blue-50 text-blue-700 border border-blue-200'
                        }`}>
                          {match.eligibilityStatus === 'ELIGIBLE' ? 'واجد شرایط کامل' : 'پذیرش مشروط'}
                        </span>
                      </div>

                      {product && (
                        <div className="text-xs text-gray-600">
                          <span className="font-semibold text-gray-800">{product.name}</span>
                          <span className="text-gray-400 mx-2">|</span>
                          <span>نرخ تقریبی: {product.indicativeMinimumRate}٪ سالانه</span>
                          <span className="text-gray-400 mx-2">|</span>
                          <span>سقف بازپرداخت: {product.maximumTenorMonths} ماه</span>
                          <span className="text-gray-400 mx-2">|</span>
                          <span>تنفس ساخت: {product.maxGracePeriodMonths || 0} ماه</span>
                        </div>
                      )}

                      <div className="flex flex-wrap gap-2 text-[11px] text-gray-500 pt-1">
                        {match.reasons.slice(0, 3).map((r: string, idx: number) => (
                          <span key={idx} className="bg-gray-100 px-2 py-0.5 rounded text-gray-700">
                            ✓ {r}
                          </span>
                        ))}
                      </div>
                    </div>

                    <div className="flex items-center gap-4 w-full lg:w-auto justify-between lg:justify-end">
                      <div className="text-center bg-blue-50/60 border border-blue-100 px-4 py-2 rounded-xl">
                        <div className="text-xs text-blue-700 font-medium">امتیاز انطباق</div>
                        <div className="text-xl font-black text-blue-700">{match.matchScore}٪</div>
                      </div>

                      <button
                        onClick={() => handleSubmitToPartner(partner.id)}
                        disabled={isSubmitting}
                        className="px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow transition flex items-center gap-1.5 whitespace-nowrap"
                      >
                        {isSubmitting ? (
                          <RefreshCw size={14} className="animate-spin" />
                        ) : (
                          <Send size={14} />
                        )}
                        ارسال پرونده به نهاد مالی
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* Sub-Tab 3: Offers Comparison Matrix */}
      {activeSubTab === 'offers' && (
        <div className="space-y-6">
          <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm">
            <div className="flex justify-between items-center pb-4 border-b border-gray-100">
              <div>
                <h3 className="text-lg font-bold text-gray-900">ماتریس مقایسه پیشنهادات تسهیلاتی</h3>
                <p className="text-xs text-gray-500 mt-1">
                  مقایسه نرمال‌شده شرایط مالی، نرخ مؤثر، تضامین و شاخص مزیت رقابتی (Hooshyar Offer Score)
                </p>
              </div>

              <button
                onClick={() => setShowOfferModal(true)}
                className="px-3.5 py-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold rounded-xl transition flex items-center gap-1.5"
              >
                <Plus size={14} />
                ثبت پیشنهاد تسهیلاتی جدید (تست/دمو)
              </button>
            </div>

            {offerComparisons.length === 0 ? (
              <div className="py-12 text-center text-gray-400">
                <FileSearch className="w-10 h-10 mx-auto mb-2 text-gray-300" />
                <p className="text-sm font-semibold text-gray-600">هنوز پیشنهادی از نهادهای مالی ثبت نشده است.</p>
                <p className="text-xs text-gray-400 mt-1">
                  پس از ارسال پرونده در تب شرکای مالی، نهادها پیشنهادات خود را ارائه خواهند داد.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 mt-6">
                {offerComparisons.map((item, idx) => {
                  const o = item.offer;
                  const isSelected = o.status === 'SELECTED' || o.status === 'FINAL';

                  return (
                    <div
                      key={o.id}
                      className={`relative p-5 rounded-2xl border transition shadow-sm ${
                        isSelected 
                          ? 'border-emerald-500 bg-emerald-50/20 ring-2 ring-emerald-500/20' 
                          : 'border-gray-200 bg-white hover:border-gray-300'
                      }`}
                    >
                      {isSelected && (
                        <div className="absolute top-3 left-3 bg-emerald-600 text-white text-[10px] font-black px-2 py-0.5 rounded-full flex items-center gap-1">
                          <CheckCircle2 size={12} />
                          پیشنهاد منتخب
                        </div>
                      )}

                      <div className="flex items-center gap-2 mb-3">
                        <span className="text-xs font-bold text-gray-500">{o.offerCode}</span>
                        <span className="px-2 py-0.5 bg-gray-100 text-gray-700 text-[10px] font-bold rounded">
                          رتبه {idx + 1}
                        </span>
                      </div>

                      <div className="mb-4">
                        <div className="text-xs text-gray-500">مبلغ مصوب تسهیلات:</div>
                        <div className="text-xl font-black text-gray-900">{formatToman(o.offeredAmount)}</div>
                        <div className="text-xs text-emerald-600 font-semibold mt-0.5">
                          پوشش {item.coveragePercent}٪ از سرمایه درخواستی
                        </div>
                      </div>

                      <div className="space-y-2.5 text-xs text-gray-700 border-t border-b border-gray-100 py-3 mb-4">
                        <div className="flex justify-between">
                          <span className="text-gray-500">نرخ سود سالانه:</span>
                          <span className="font-bold text-gray-900">{item.effectiveRateLabel}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-500">دوره کل بازپرداخت:</span>
                          <span className="font-bold text-gray-900">{o.tenorMonths} ماه</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-500">دوره تنفس ساخت:</span>
                          <span className="font-bold text-gray-900">{o.gracePeriodMonths} ماه</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-500">قسط ماهیانه تخمینی:</span>
                          <span className="font-bold text-blue-700 font-mono">
                            {formatToman(item.monthlyPayment)}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-500">کل هزینه مالی (سود + کارمزد):</span>
                          <span className="font-bold text-gray-800">
                            {formatToman(item.totalFinancingCost)}
                          </span>
                        </div>
                      </div>

                      {/* Strengths */}
                      <div className="mb-4 space-y-1">
                        <div className="text-[11px] font-bold text-gray-600">مزایای کلیدی:</div>
                        {item.keyStrengths.map((str, sIdx) => (
                          <div key={sIdx} className="text-[11px] text-emerald-700 flex items-center gap-1">
                            ✓ {str}
                          </div>
                        ))}
                      </div>

                      {/* Action buttons */}
                      <div className="pt-2">
                        {!isSelected ? (
                          <button
                            onClick={() => handleSelectOffer(o.id)}
                            className="w-full py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl transition shadow-sm"
                          >
                            انتخاب این پیشنهاد به عنوان گزینه برتر
                          </button>
                        ) : (
                          <button
                            onClick={() => handleRecordPartnerApproval(o.id)}
                            className="w-full py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl transition shadow-sm flex items-center justify-center gap-1.5"
                          >
                            <ShieldCheck size={16} />
                            ثبت تصویب نهایی در ارکان اعتباری
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Sub-Tab 4: Partner Review Console (Simulated Partner Dashboard) */}
      {activeSubTab === 'partner_console' && (
        <div className="space-y-6">
          <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm">
            <div className="flex justify-between items-center pb-4 border-b border-gray-100">
              <div>
                <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                  <Building2 size={20} className="text-indigo-600" />
                  کنسول ارزیابی نهاد مالی (Financial Partner Review View)
                </h3>
                <p className="text-xs text-gray-500 mt-1">
                  نمای ویژه کارشناس اعتباری بانک و صندوق جهت بررسی مستندات، درخواست اطلاعات و صدور پیشنهاد
                </p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => setShowInfoRequestModal(true)}
                  className="px-3.5 py-2 bg-amber-50 text-amber-800 border border-amber-200 hover:bg-amber-100 text-xs font-bold rounded-xl transition flex items-center gap-1.5"
                >
                  <HelpCircle size={14} />
                  درخواست مستندات تکمیلی
                </button>
                <button
                  onClick={() => setShowOfferModal(true)}
                  className="px-3.5 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl transition flex items-center gap-1.5"
                >
                  <Plus size={14} />
                  صدور پیشنهاد تسهیلات رسمی
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
              {/* Due Diligence Checklist */}
              <div className="bg-gray-50 p-5 rounded-xl border border-gray-200 space-y-3">
                <h4 className="font-bold text-xs text-gray-800 flex items-center gap-1.5">
                  <FileSearch size={16} className="text-blue-600" />
                  چک‌لیست ارزیابی موشکافانه اعتباری (Due Diligence)
                </h4>
                <div className="space-y-2 text-xs">
                  <div className="flex items-center justify-between p-2.5 bg-white rounded-lg border border-gray-100">
                    <span className="font-medium text-gray-700">بررسی مدل مالی و شاخص DSCR</span>
                    <span className="text-emerald-600 font-bold">تایید شده (DSCR &gt; 1.3)</span>
                  </div>
                  <div className="flex items-center justify-between p-2.5 bg-white rounded-lg border border-gray-100">
                    <span className="font-medium text-gray-700">تطبیق ظرفیت نامی با شبیه‌سازی PVsyst</span>
                    <span className="text-emerald-600 font-bold">مطابق و موثق</span>
                  </div>
                  <div className="flex items-center justify-between p-2.5 bg-white rounded-lg border border-gray-100">
                    <span className="font-medium text-gray-700">استعلام اتصال به شبکه از شرکت توزیع برق</span>
                    <span className="text-amber-600 font-bold">در حال استعلام</span>
                  </div>
                  <div className="flex items-center justify-between p-2.5 bg-white rounded-lg border border-gray-100">
                    <span className="font-medium text-gray-700">کارشناسی و ارزیابی وثایق ملکی</span>
                    <span className="text-emerald-600 font-bold">پوشش ۱۲۰٪ اصل و فرع</span>
                  </div>
                </div>
              </div>

              {/* Data Room Access */}
              <div className="bg-gray-50 p-5 rounded-xl border border-gray-200 space-y-3">
                <h4 className="font-bold text-xs text-gray-800 flex items-center gap-1.5">
                  <Lock size={16} className="text-indigo-600" />
                  دسترسی به اسناد مجاز اتاق داده (Data Room)
                </h4>
                <div className="space-y-2 text-xs">
                  <div className="p-2.5 bg-white rounded-lg border border-gray-100 flex justify-between items-center">
                    <div>
                      <div className="font-bold text-gray-800">گزارش مالی و پیش‌بینی سودآوری</div>
                      <div className="text-[10px] text-gray-400">فرمت PDF مصوب</div>
                    </div>
                    <span className="text-xs text-blue-600 font-semibold cursor-pointer">مشاهده سند</span>
                  </div>
                  <div className="p-2.5 bg-white rounded-lg border border-gray-100 flex justify-between items-center">
                    <div>
                      <div className="font-bold text-gray-800">پروانه احداث و مجوز ساتبا</div>
                      <div className="text-[10px] text-gray-400">کد رهگیری معتبر</div>
                    </div>
                    <span className="text-xs text-blue-600 font-semibold cursor-pointer">مشاهده سند</span>
                  </div>
                  <div className="p-2.5 bg-white rounded-lg border border-gray-100 flex justify-between items-center">
                    <div>
                      <div className="font-bold text-gray-800">طرح توجیهی و دیاگرام تک‌خطی (SLD)</div>
                      <div className="text-[10px] text-gray-400">مهندسی فتوولتائیک</div>
                    </div>
                    <span className="text-xs text-blue-600 font-semibold cursor-pointer">مشاهده سند</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Sub-Tab 5: Finalized Project Financing Record & Amortization Schedule */}
      {activeSubTab === 'amortization' && financingRecord && (
        <div className="space-y-6">
          <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 pb-6 border-b border-gray-100">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="px-2.5 py-0.5 bg-emerald-100 text-emerald-800 font-bold text-xs rounded-full">
                    قرارداد نهایی مصوب
                  </span>
                  <span className="text-xs text-gray-400">شناسه: {financingRecord.id}</span>
                </div>
                <h3 className="text-xl font-bold text-gray-900">مشخصات تسهیلات مصوب و جدول بازپرداخت اقساط</h3>
              </div>

              <div className="text-left">
                <div className="text-xs text-gray-400">مبلغ مصوب تسهیلات</div>
                <div className="text-2xl font-black text-emerald-600">
                  {formatToman(financingRecord.approvedAmount)}
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 py-4 my-2 border-b border-gray-100 text-xs">
              <div>
                <span className="text-gray-400">نرخ سود مصوب:</span>
                <div className="font-bold text-gray-800 text-sm mt-0.5">{financingRecord.interestRate}٪ سالانه</div>
              </div>
              <div>
                <span className="text-gray-400">مدت تسهیلات:</span>
                <div className="font-bold text-gray-800 text-sm mt-0.5">{financingRecord.tenorMonths} ماه</div>
              </div>
              <div>
                <span className="text-gray-400">دوره تنفس ساخت:</span>
                <div className="font-bold text-gray-800 text-sm mt-0.5">{financingRecord.gracePeriodMonths} ماه</div>
              </div>
              <div>
                <span className="text-gray-400">روش بازپرداخت:</span>
                <div className="font-bold text-gray-800 text-sm mt-0.5">{financingRecord.repaymentType}</div>
              </div>
            </div>

            {/* Simple amortization preview */}
            <div className="mt-4">
              <h4 className="font-bold text-xs text-gray-700 mb-3 flex items-center gap-1.5">
                <Calendar size={14} className="text-blue-600" />
                نمای شماتیک اقساط دوره تنفس و بازپرداخت (نمونه ماه‌های اول تا ششم)
              </h4>
              <div className="overflow-x-auto">
                <table className="w-full text-right text-xs">
                  <thead className="bg-gray-50 text-gray-600 border-b border-gray-200">
                    <tr>
                      <th className="py-2.5 px-3">شماره قسط / ماه</th>
                      <th className="py-2.5 px-3">وضعیت دوره</th>
                      <th className="py-2.5 px-3">مانده ابتدای دوره</th>
                      <th className="py-2.5 px-3">سهم سود</th>
                      <th className="py-2.5 px-3">سهم اصل</th>
                      <th className="py-2.5 px-3">کل قسط ماهانه</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {[1, 2, 3, 4, 5, 6, 7, 8].map(m => {
                      const isGrace = m <= (financingRecord.gracePeriodMonths || 0);
                      const principal = financingRecord.approvedAmount;
                      const monthlyRate = ((financingRecord.interestRate || 23) / 100) / 12;
                      const interest = Math.round(principal * monthlyRate);
                      const pmt = isGrace ? interest : Math.round(interest + (principal / ((financingRecord.tenorMonths || 48) - (financingRecord.gracePeriodMonths || 6))));

                      return (
                        <tr key={m} className={isGrace ? 'bg-amber-50/40' : 'hover:bg-gray-50'}>
                          <td className="py-2.5 px-3 font-medium">ماه {m}</td>
                          <td className="py-2.5 px-3">
                            {isGrace ? (
                              <span className="px-2 py-0.5 bg-amber-100 text-amber-800 text-[10px] font-bold rounded">
                                تنفس ساخت (تنها سود)
                              </span>
                            ) : (
                              <span className="px-2 py-0.5 bg-blue-50 text-blue-700 text-[10px] font-bold rounded">
                                بازپرداخت اصل و سود
                              </span>
                            )}
                          </td>
                          <td className="py-2.5 px-3 font-mono">{formatToman(principal)}</td>
                          <td className="py-2.5 px-3 font-mono text-gray-700">{formatToman(interest)}</td>
                          <td className="py-2.5 px-3 font-mono text-gray-700">{isGrace ? '۰' : formatToman(pmt - interest)}</td>
                          <td className="py-2.5 px-3 font-mono font-bold text-blue-700">{formatToman(pmt)}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Create Financing Request Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-xl w-full p-6 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center pb-3 border-b border-gray-100">
              <h3 className="text-lg font-bold text-gray-900">ایجاد پرونده درخواست تأمین مالی</h3>
              <button 
                onClick={() => setShowCreateModal(false)}
                className="text-gray-400 hover:text-gray-600 text-sm font-bold"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateRequest} className="space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-gray-600 font-bold mb-1">کل هزینه پروژه (میلیون تومان):</label>
                  <input
                    type="number"
                    value={reqForm.totalProjectCostTomans}
                    onChange={(e) => setReqForm({ ...reqForm, totalProjectCostTomans: Number(e.target.value) })}
                    className="w-full px-3 py-2 border rounded-xl"
                    required
                  />
                </div>
                <div>
                  <label className="block text-gray-600 font-bold mb-1">آورده کارفرما (میلیون تومان):</label>
                  <input
                    type="number"
                    value={reqForm.ownerEquityTomans}
                    onChange={(e) => setReqForm({ ...reqForm, ownerEquityTomans: Number(e.target.value) })}
                    className="w-full px-3 py-2 border rounded-xl"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-gray-600 font-bold mb-1">مبلغ درخواستی وام (میلیون تومان):</label>
                <input
                  type="number"
                  value={reqForm.requestedAmountTomans}
                  onChange={(e) => setReqForm({ ...reqForm, requestedAmountTomans: Number(e.target.value) })}
                  className="w-full px-3 py-2 border rounded-xl text-blue-700 font-bold"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-gray-600 font-bold mb-1">دوره بازپرداخت (ماه):</label>
                  <input
                    type="number"
                    value={reqForm.requestedTenorMonths}
                    onChange={(e) => setReqForm({ ...reqForm, requestedTenorMonths: Number(e.target.value) })}
                    className="w-full px-3 py-2 border rounded-xl"
                    required
                  />
                </div>
                <div>
                  <label className="block text-gray-600 font-bold mb-1">تنفس ساخت (ماه):</label>
                  <input
                    type="number"
                    value={reqForm.preferredGracePeriodMonths}
                    onChange={(e) => setReqForm({ ...reqForm, preferredGracePeriodMonths: Number(e.target.value) })}
                    className="w-full px-3 py-2 border rounded-xl"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-gray-600 font-bold mb-1">مدل درآمدی:</label>
                  <select
                    value={reqForm.projectRevenueModel}
                    onChange={(e) => setReqForm({ ...reqForm, projectRevenueModel: e.target.value })}
                    className="w-full px-3 py-2 border rounded-xl bg-white"
                  >
                    <option value="PPA">خرید تضمینی ساتبا (PPA)</option>
                    <option value="SELF_CONSUMPTION">خودمصرفی صنعتی/خانگی</option>
                    <option value="GRID_EXPORT">عرضه به تابلوی سبز بورس</option>
                    <option value="MIXED">ترکیبی</option>
                  </select>
                </div>
                <div>
                  <label className="block text-gray-600 font-bold mb-1">شیوه بازپرداخت:</label>
                  <select
                    value={reqForm.repaymentPreference}
                    onChange={(e) => setReqForm({ ...reqForm, repaymentPreference: e.target.value })}
                    className="w-full px-3 py-2 border rounded-xl bg-white"
                  >
                    <option value="EQUAL_INSTALLMENT">اقساط مساوی (Annuity)</option>
                    <option value="EQUAL_PRINCIPAL">اصل مساوی</option>
                    <option value="BULLET">تسویه یکجا در سررسید</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-gray-600 font-bold mb-1">خلاصه وثایق و تضامین متقاضی:</label>
                <textarea
                  value={reqForm.collateralSummary}
                  onChange={(e) => setReqForm({ ...reqForm, collateralSummary: e.target.value })}
                  rows={2}
                  className="w-full px-3 py-2 border rounded-xl"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-4 py-2 border rounded-xl text-gray-600"
                >
                  انصراف
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl shadow"
                >
                  ثبت و محاسبه هوشمند شاخص آمادگی
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* New Offer Modal */}
      {showOfferModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl space-y-4">
            <div className="flex justify-between items-center pb-3 border-b border-gray-100">
              <h3 className="text-base font-bold text-gray-900">ثبت پیشنهاد تسهیلات رسمی (نمایندگی نهاد مالی)</h3>
              <button 
                onClick={() => setShowOfferModal(false)}
                className="text-gray-400 hover:text-gray-600 text-sm font-bold"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handlePartnerSubmitOffer} className="space-y-3 text-xs">
              <div>
                <label className="block text-gray-600 font-bold mb-1">مبلغ مصوب وام (میلیون تومان):</label>
                <input
                  type="number"
                  value={newOfferForm.offeredAmountTomans}
                  onChange={(e) => setNewOfferForm({ ...newOfferForm, offeredAmountTomans: Number(e.target.value) })}
                  className="w-full px-3 py-2 border rounded-xl font-bold text-blue-700"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-gray-600 font-bold mb-1">نرخ سود سالانه (درصد):</label>
                  <input
                    type="number"
                    value={newOfferForm.interestRate}
                    onChange={(e) => setNewOfferForm({ ...newOfferForm, interestRate: Number(e.target.value) })}
                    className="w-full px-3 py-2 border rounded-xl"
                    required
                  />
                </div>
                <div>
                  <label className="block text-gray-600 font-bold mb-1">مدت کل تسهیلات (ماه):</label>
                  <input
                    type="number"
                    value={newOfferForm.tenorMonths}
                    onChange={(e) => setNewOfferForm({ ...newOfferForm, tenorMonths: Number(e.target.value) })}
                    className="w-full px-3 py-2 border rounded-xl"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-gray-600 font-bold mb-1">دوره تنفس ساخت (ماه):</label>
                <input
                  type="number"
                  value={newOfferForm.gracePeriodMonths}
                  onChange={(e) => setNewOfferForm({ ...newOfferForm, gracePeriodMonths: Number(e.target.value) })}
                  className="w-full px-3 py-2 border rounded-xl"
                  required
                />
              </div>

              <div>
                <label className="block text-gray-600 font-bold mb-1">شروط تضامین و وثایق:</label>
                <input
                  type="text"
                  value={newOfferForm.collateralText}
                  onChange={(e) => setNewOfferForm({ ...newOfferForm, collateralText: e.target.value })}
                  className="w-full px-3 py-2 border rounded-xl"
                />
              </div>

              <div>
                <label className="block text-gray-600 font-bold mb-1">شروط مقدماتی انعقاد (Conditions Precedent):</label>
                <input
                  type="text"
                  value={newOfferForm.conditionsText}
                  onChange={(e) => setNewOfferForm({ ...newOfferForm, conditionsText: e.target.value })}
                  className="w-full px-3 py-2 border rounded-xl"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t">
                <button
                  type="button"
                  onClick={() => setShowOfferModal(false)}
                  className="px-4 py-2 border rounded-xl text-gray-600"
                >
                  انصراف
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl shadow"
                >
                  ارسال رسمی پیشنهاد به کارفرما
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Info Request Modal */}
      {showInfoRequestModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4">
            <div className="flex justify-between items-center pb-3 border-b border-gray-100">
              <h3 className="text-base font-bold text-gray-900">درخواست مستندات تکمیلی اعتباری</h3>
              <button 
                onClick={() => setShowInfoRequestModal(false)}
                className="text-gray-400 hover:text-gray-600 text-sm font-bold"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block text-gray-600 font-bold mb-1">عنوان درخواست:</label>
                <input
                  type="text"
                  value={infoReqForm.title}
                  onChange={(e) => setInfoReqForm({ ...infoReqForm, title: e.target.value })}
                  className="w-full px-3 py-2 border rounded-xl"
                />
              </div>
              <div>
                <label className="block text-gray-600 font-bold mb-1">توضیحات و مدارک مورد نیاز:</label>
                <textarea
                  value={infoReqForm.description}
                  onChange={(e) => setInfoReqForm({ ...infoReqForm, description: e.target.value })}
                  rows={3}
                  className="w-full px-3 py-2 border rounded-xl"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t">
                <button
                  onClick={() => setShowInfoRequestModal(false)}
                  className="px-4 py-2 border rounded-xl text-gray-600"
                >
                  انصراف
                </button>
                <button
                  onClick={() => {
                    setShowInfoRequestModal(false);
                    alert('درخواست مدارک تکمیلی با موفقیت برای کارفرمای پروژه ارسال شد.');
                  }}
                  className="px-5 py-2 bg-amber-600 hover:bg-amber-700 text-white font-bold rounded-xl shadow"
                >
                  ارسال درخواست به کارفرما
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
