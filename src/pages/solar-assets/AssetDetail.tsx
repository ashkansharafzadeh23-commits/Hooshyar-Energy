import React, { useState } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import { AssetPassport } from '../../components/assets/passport/AssetPassport';
import { AssetOperationsWorkspace } from '../../components/operations/AssetOperationsWorkspace';
import { FileText, Activity } from 'lucide-react';

export default function SolarAssetDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  const currentView = searchParams.get('view') || (searchParams.get('tab') === 'operations' ? 'operations' : 'operations');

  const setView = (view: 'passport' | 'operations') => {
    setSearchParams({ view });
  };

  if (!id) {
    return (
      <div className="p-8 text-center text-xs text-slate-500">
        شناسه دارایی نامعتبر است.
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Top View Mode Switcher */}
      <div className="max-w-6xl mx-auto px-4 pt-4 flex items-center justify-between" dir="rtl">
        <div className="inline-flex bg-slate-100 dark:bg-slate-850 p-1.5 rounded-2xl border border-slate-200 dark:border-slate-800 text-xs shadow-xs">
          <button
            type="button"
            onClick={() => setView('operations')}
            className={`min-h-[40px] px-4 py-2 rounded-xl font-bold transition-all flex items-center gap-2 ${
              currentView === 'operations'
                ? 'bg-amber-500 text-slate-950 shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <Activity className="w-4 h-4" />
            <span>مرکز عملیات و پایش (Operations Center)</span>
          </button>

          <button
            type="button"
            onClick={() => setView('passport')}
            className={`min-h-[40px] px-4 py-2 rounded-xl font-bold transition-all flex items-center gap-2 ${
              currentView === 'passport'
                ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <FileText className="w-4 h-4" />
            <span>شناسنامه فنی دارایی (Asset Passport)</span>
          </button>
        </div>
      </div>

      {/* Selected View */}
      {currentView === 'operations' ? (
        <AssetOperationsWorkspace
          assetId={id}
          onNavigateToPassport={() => setView('passport')}
          onBack={() => navigate('/solar-assets')}
        />
      ) : (
        <div className="max-w-6xl mx-auto py-4 sm:py-6 px-4 space-y-6">
          <AssetPassport
            assetId={id}
            onBack={() => navigate('/solar-assets')}
          />
        </div>
      )}
    </div>
  );
}
