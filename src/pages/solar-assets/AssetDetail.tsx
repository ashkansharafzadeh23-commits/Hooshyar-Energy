import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { AssetPassport } from '../../components/assets/passport/AssetPassport';

export default function SolarAssetDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  if (!id) {
    return (
      <div className="p-8 text-center text-xs text-slate-500">
        شناسه دارایی نامعتبر است.
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto py-4 sm:py-6 px-4 space-y-6">
      <AssetPassport
        assetId={id}
        onBack={() => navigate('/solar-assets')}
      />
    </div>
  );
}
