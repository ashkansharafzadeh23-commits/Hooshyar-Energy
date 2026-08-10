const fs = require('fs');
let code = fs.readFileSync('src/pages/ContractorDashboard.tsx', 'utf-8');

const targetImport = "import { AreaChart, Area, XAxis, YAxis, CartesianGrid, ResponsiveContainer, Tooltip } from 'recharts';";
code = code.replace(targetImport, targetImport + "\nimport { useEffect } from 'react';");

const stateDef = "  const [activeTab, setActiveTab] = useState('overview');";
code = code.replace(stateDef, stateDef + `
  const [requests, setRequests] = useState<any[]>([]);
  const [replyText, setReplyText] = useState<{ [key: string]: string }>({});

  useEffect(() => {
    const loadedReqs = JSON.parse(localStorage.getItem('epc_requests') || '[]');
    setRequests(loadedReqs);
  }, []);

  const handleReply = (reqId: string) => {
    if (!replyText[reqId]) return;
    const currentReqs = JSON.parse(localStorage.getItem('epc_requests') || '[]');
    const updatedReqs = currentReqs.map((req: any) => {
      if (req.id === reqId) {
        return {
          ...req,
          replies: [
            ...(req.replies || []),
            {
              epcName: 'مهندسی نیروپژوهان',
              message: replyText[reqId],
              createdAt: new Date().toISOString()
            }
          ]
        };
      }
      return req;
    });
    localStorage.setItem('epc_requests', JSON.stringify(updatedReqs));
    setRequests(updatedReqs);
    setReplyText({ ...replyText, [reqId]: '' });
  };
`);

const requestsTab = `
        {activeTab === 'requests' && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
            {requests.length === 0 ? (
              <div className="bg-white p-8 rounded-2xl border border-gray-100 shadow-sm text-center py-20">
                <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6 text-gray-400">
                  <FileText size={48} />
                </div>
                <h2 className="text-xl font-bold text-gray-800 mb-2">درخواستی یافت نشد</h2>
                <p className="text-gray-500">در حال حاضر هیچ درخواست جدیدی برای احداث نیروگاه ثبت نشده است.</p>
              </div>
            ) : (
              requests.map((req) => (
                <div key={req.id} className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex flex-col gap-4">
                  <div className="flex items-center justify-between border-b border-gray-100 pb-4">
                    <div>
                      <h3 className="font-bold text-gray-800 text-lg">درخواست احداث نیروگاه - شناسه {req.id.substring(req.id.length - 4)}</h3>
                      <p className="text-sm text-gray-500 mt-1 flex items-center gap-1">
                        <Clock size={14} /> ثبت شده در {new Date(req.createdAt).toLocaleDateString('fa-IR')}
                      </p>
                    </div>
                    <span className="bg-blue-50 text-blue-600 px-3 py-1 rounded-full text-xs font-bold">
                      {req.replies && req.replies.length > 0 ? 'پاسخ داده شده' : 'درخواست جدید'}
                    </span>
                  </div>
                  
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 bg-gray-50 p-4 rounded-xl">
                    <div>
                      <span className="text-xs text-gray-500 block mb-1">متراژ</span>
                      <span className="font-bold text-gray-800">{req.area} متر مربع</span>
                    </div>
                    <div>
                      <span className="text-xs text-gray-500 block mb-1">شهر</span>
                      <span className="font-bold text-gray-800">{req.city}</span>
                    </div>
                    <div>
                      <span className="text-xs text-gray-500 block mb-1">نوع سقف</span>
                      <span className="font-bold text-gray-800">{req.roofType === 'flat' ? 'مسطح' : req.roofType === 'sloped' ? 'شیب‌دار' : 'زمین مسطح'}</span>
                    </div>
                    <div>
                      <span className="text-xs text-gray-500 block mb-1">بودجه تخمینی</span>
                      <span className="font-bold text-gray-800">{req.budget} {req.budgetUnit === 'million' ? 'میلیون' : 'میلیارد'} تومان</span>
                    </div>
                  </div>
                  
                  <div className="bg-amber-50 p-3 rounded-lg flex items-center gap-2 text-sm text-amber-700">
                    <CheckCircle size={16} className="text-amber-500 shrink-0" />
                    اطلاعات تماس کاربر مخفی است. پاسخ شما برای کاربر ارسال می‌شود و در صورت تایید، ارتباط مستقیم برقرار می‌گردد.
                  </div>

                  {req.replies && req.replies.length > 0 && (
                    <div className="border-t border-gray-100 pt-4 mt-2">
                      <h4 className="font-bold text-gray-700 text-sm mb-3">پاسخ‌های ثبت شده:</h4>
                      <div className="space-y-3">
                        {req.replies.map((reply: any, i: number) => (
                          <div key={i} className="bg-gray-50 p-4 rounded-xl border border-gray-100">
                            <div className="flex justify-between items-start mb-2">
                              <span className="font-bold text-sm text-gray-800">{reply.epcName}</span>
                              <span className="text-xs text-gray-400">{new Date(reply.createdAt).toLocaleDateString('fa-IR')}</span>
                            </div>
                            <p className="text-sm text-gray-600">{reply.message}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  <div className="mt-2">
                    <label className="block text-sm font-bold text-gray-700 mb-2">ثبت پیشنهاد جدید:</label>
                    <textarea 
                      className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-amber-500 focus:ring-2 focus:ring-amber-200 outline-none transition-all resize-none text-sm"
                      rows={3}
                      placeholder="پیام یا پیشنهاد خود را برای کاربر بنویسید..."
                      value={replyText[req.id] || ''}
                      onChange={(e) => setReplyText({...replyText, [req.id]: e.target.value})}
                    ></textarea>
                    <button 
                      onClick={() => handleReply(req.id)}
                      disabled={!replyText[req.id]}
                      className="mt-3 bg-amber-500 text-white px-6 py-2.5 rounded-xl font-bold text-sm hover:bg-amber-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      ارسال پاسخ به کاربر
                    </button>
                  </div>
                </div>
              ))
            )}
          </motion.div>
        )}
`;

code = code.replace("{activeTab !== 'overview' && (", requestsTab + "\n        {activeTab !== 'overview' && activeTab !== 'requests' && (");

fs.writeFileSync('src/pages/ContractorDashboard.tsx', code);
