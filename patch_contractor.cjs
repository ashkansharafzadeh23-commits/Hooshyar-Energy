const fs = require('fs');

let code = fs.readFileSync('src/pages/ContractorDashboard.tsx', 'utf8');

const profileTabHtml = `
        {activeTab === 'profile' && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="bg-white rounded-3xl border border-gray-200 shadow-sm p-6 sm:p-8">
            <h2 className="text-2xl font-black text-gray-900 mb-6 flex items-center gap-2">
              <Settings className="text-amber-600" size={28} />
              ویرایش اطلاعات و بارگذاری مدارک
            </h2>
            <form className="space-y-6" onSubmit={(e) => { e.preventDefault(); alert('اطلاعات با موفقیت ذخیره شد'); }}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">نام شرکت / پیمانکار</label>
                  <input type="text" defaultValue="مهندسی نیروپژوهان" className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-amber-500 focus:ring-2 focus:ring-amber-200 outline-none transition-all" />
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">حوزه فعالیت</label>
                  <input type="text" defaultValue="نصب و راه‌اندازی نیروگاه‌های خورشیدی" className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-amber-500 focus:ring-2 focus:ring-amber-200 outline-none transition-all" />
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">شماره تماس</label>
                  <input type="text" defaultValue="021-88888888" className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-amber-500 focus:ring-2 focus:ring-amber-200 outline-none transition-all" />
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">آدرس دفتر مرکزی</label>
                  <input type="text" defaultValue="تهران، ونک" className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-amber-500 focus:ring-2 focus:ring-amber-200 outline-none transition-all" />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-bold text-gray-700 mb-2">درباره شرکت</label>
                  <textarea rows={3} defaultValue="شرکت نیروپژوهان با بیش از ده سال سابقه در طراحی و اجرای نیروگاه‌های خورشیدی مگاواتی." className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-amber-500 focus:ring-2 focus:ring-amber-200 outline-none transition-all resize-none"></textarea>
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-bold text-gray-700 mb-2">بارگذاری مدارک شرکت (اساسنامه، گواهی صلاحیت، رزومه)</label>
                  <div className="border-2 border-dashed border-gray-300 rounded-xl p-8 text-center hover:border-amber-500 transition-colors cursor-pointer bg-gray-50/50">
                    <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center mx-auto mb-4 shadow-sm">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-amber-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                      </svg>
                    </div>
                    <p className="text-sm font-bold text-gray-700 mb-1">فایل‌های خود را اینجا رها کنید یا کلیک کنید</p>
                    <p className="text-xs text-gray-500">PDF, JPG, PNG (حداکثر ۱۰ مگابایت)</p>
                  </div>
                </div>
              </div>
              <div className="pt-4 border-t border-gray-100 flex gap-4">
                <button type="submit" className="bg-amber-500 text-white px-8 py-3 rounded-xl font-bold hover:bg-amber-600 transition-colors text-sm">
                  ذخیره اطلاعات
                </button>
                <button type="button" onClick={() => setActiveTab('overview')} className="bg-gray-100 text-gray-700 px-8 py-3 rounded-xl font-bold hover:bg-gray-200 transition-colors text-sm">
                  بازگشت
                </button>
              </div>
            </form>
          </motion.div>
        )}
        
        {activeTab !== 'overview' && activeTab !== 'requests' && activeTab !== 'profile' && (
`;

code = code.replace(
  /{activeTab !== 'overview' && activeTab !== 'requests' && \(/,
  profileTabHtml
);

fs.writeFileSync('src/pages/ContractorDashboard.tsx', code);
