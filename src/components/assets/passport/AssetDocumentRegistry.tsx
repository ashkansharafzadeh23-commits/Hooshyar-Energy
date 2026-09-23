import React from 'react';
import { FileText, Eye, CheckCircle2, Clock, AlertCircle } from 'lucide-react';
import { ExecutionDoc } from '../../execution/ExecutionDocuments';

interface AssetDocumentRegistryProps {
  documents: ExecutionDoc[];
  loading?: boolean;
  className?: string;
}

export const AssetDocumentRegistry: React.FC<AssetDocumentRegistryProps> = ({
  documents,
  loading = false,
  className = ''
}) => {
  return (
    <div className={`space-y-4 ${className}`}>
      <div>
        <h3 className="text-sm font-bold text-slate-900 dark:text-zinc-100 flex items-center gap-2">
          <FileText className="w-4 h-4 text-blue-600 dark:text-blue-400" />
          <span>بایگانی اسناد و مدارک رسمی دارایی ({documents.length})</span>
        </h3>
        <p className="text-xs text-slate-500 dark:text-zinc-400 mt-0.5">
          اسناد قانونی، نقشه‌های چون‌ساخت، تأییدیه‌های دیسپاچینگ و کتابچه‌های O&M
        </p>
      </div>

      {loading ? (
        <div className="py-12 text-center text-xs text-slate-400 animate-pulse">
          در حال بارگذاری اسناد دارایی...
        </div>
      ) : documents.length === 0 ? (
        <div className="p-8 text-center rounded-2xl bg-slate-50/60 dark:bg-zinc-800/30 border border-dashed border-slate-200 dark:border-zinc-800">
          <FileText className="w-8 h-8 text-slate-300 dark:text-zinc-600 mx-auto mb-2" />
          <p className="text-xs font-semibold text-slate-700 dark:text-zinc-300">
            سندی در پرونده دیجیتال دارایی ثبت نشده است.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {documents.map((doc) => {
            const docName = doc.name || doc.title || doc.fileName || 'سند رسمی دارایی';
            const docUrl = doc.fileUrl || doc.url || '#';

            return (
              <div
                key={doc.id}
                className="p-4 rounded-2xl border border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 flex flex-col justify-between gap-3 shadow-xs"
              >
                <div className="flex items-start gap-2.5">
                  <div className="w-9 h-9 rounded-xl bg-blue-50 dark:bg-blue-950/50 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0">
                    <FileText className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-slate-900 dark:text-zinc-100 line-clamp-1">
                      {docName}
                    </h4>
                    <span className="text-[11px] text-slate-500 dark:text-zinc-400">
                      {doc.type || doc.documentType || 'سند مصوب'}
                    </span>
                  </div>
                </div>

                <div className="pt-2 border-t border-slate-100 dark:border-zinc-800 flex items-center justify-between text-[11px] text-slate-400 dark:text-zinc-500">
                  <span>
                    {doc.uploadedAt || doc.createdAt
                      ? new Date(doc.uploadedAt || doc.createdAt!).toLocaleDateString('fa-IR')
                      : 'تاریخ ثبت نشده'}
                  </span>

                  <a
                    href={docUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center gap-1 text-blue-600 dark:text-blue-400 font-bold hover:underline min-h-[44px] px-2"
                  >
                    <Eye className="w-3.5 h-3.5" />
                    <span>مشاهده مدرک</span>
                  </a>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
