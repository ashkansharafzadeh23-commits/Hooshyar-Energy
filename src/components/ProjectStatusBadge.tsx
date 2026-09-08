import React from 'react';
import { ProjectStatus } from '../types/project';

const STATUS_LABELS: Record<ProjectStatus, string> = {
  DRAFT: 'پیشنویس',
  ANALYSIS: 'تحلیل انرژی',
  FEASIBILITY: 'امکان‌سنجی',
  READY_FOR_RFQ: 'آماده استعلام',
  RFQ_OPEN: 'استعلام باز',
  BIDS_RECEIVED: 'پیشنهادها دریافت شد',
  EPC_SELECTED: 'مجری انتخاب شد',
  CONTRACTING: 'قرارداد',
  FINANCING: 'تأمین مالی',
  PROCUREMENT: 'تأمین تجهیزات',
  CONSTRUCTION: 'در حال اجرا',
  COMMISSIONING: 'راه‌اندازی',
  OPERATIONAL: 'بهره‌برداری',
  MAINTENANCE: 'نگهداری',
  CANCELLED: 'لغو شده'
};

const STATUS_COLORS: Record<ProjectStatus, string> = {
  DRAFT: 'bg-gray-100 text-gray-700',
  ANALYSIS: 'bg-blue-100 text-blue-700',
  FEASIBILITY: 'bg-indigo-100 text-indigo-700',
  READY_FOR_RFQ: 'bg-purple-100 text-purple-700',
  RFQ_OPEN: 'bg-fuchsia-100 text-fuchsia-700',
  BIDS_RECEIVED: 'bg-pink-100 text-pink-700',
  EPC_SELECTED: 'bg-rose-100 text-rose-700',
  CONTRACTING: 'bg-orange-100 text-orange-700',
  FINANCING: 'bg-amber-100 text-amber-700',
  PROCUREMENT: 'bg-yellow-100 text-yellow-700',
  CONSTRUCTION: 'bg-lime-100 text-lime-700',
  COMMISSIONING: 'bg-emerald-100 text-emerald-700',
  OPERATIONAL: 'bg-green-100 text-green-700',
  MAINTENANCE: 'bg-teal-100 text-teal-700',
  CANCELLED: 'bg-red-100 text-red-700'
};

export const ProjectStatusBadge: React.FC<{ status: ProjectStatus }> = ({ status }) => {
  return (
    <span className={`px-2 py-1 rounded-md text-xs font-bold \${STATUS_COLORS[status]}`}>
      {STATUS_LABELS[status]}
    </span>
  );
};
