const fs = require('fs');

let code = fs.readFileSync('src/pages/technician/Dashboard.tsx', 'utf8');

// Replace the edit profile button to change tab
code = code.replace(
  /<button className="w-full text-right flex items-center justify-between group">/g,
  `<button onClick={() => setActiveTab('profile')} className="w-full text-right flex items-center justify-between group">`
);

// Add the profile tab in the left panel
const profileTabHtml = `
          {activeTab === 'profile' && (
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="bg-white rounded-3xl border border-gray-200 shadow-sm p-6 sm:p-8">
              <h2 className="text-2xl font-black text-gray-900 mb-6 flex items-center gap-2">
                <UserCircle className="text-green-600" size={28} />
                ویرایش اطلاعات و بارگذاری مدارک
              </h2>
              <form className="space-y-6" onSubmit={(e) => { e.preventDefault(); alert('اطلاعات با موفقیت ذخیره شد'); }}>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">نام و نام خانوادگی</label>
                    <input type="text" defaultValue="مهندس احمدی" className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-green-500 focus:ring-2 focus:ring-green-200 outline-none transition-all" />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">تخصص اصلی</label>
                    <input type="text" defaultValue="متخصص سیستم‌های خورشیدی" className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-green-500 focus:ring-2 focus:ring-green-200 outline-none transition-all" />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">شماره تماس</label>
                    <input type="text" defaultValue="09123456789" className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-green-500 focus:ring-2 focus:ring-green-200 outline-none transition-all" />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">شهر و منطقه فعالیت</label>
                    <input type="text" defaultValue="تهران، البرز" className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-green-500 focus:ring-2 focus:ring-green-200 outline-none transition-all" />
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-sm font-bold text-gray-700 mb-2">درباره من (بیوگرافی)</label>
                    <textarea rows={3} defaultValue="متخصص در راه‌اندازی و اورهال سیستم‌های آف‌گرید با ۱۰ سال سابقه فعالیت در پروژه‌های صنعتی." className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-green-500 focus:ring-2 focus:ring-green-200 outline-none transition-all resize-none"></textarea>
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-sm font-bold text-gray-700 mb-2">بارگذاری مدارک جدید (رزومه، گواهینامه، نمونه کار)</label>
                    <div className="border-2 border-dashed border-gray-300 rounded-xl p-8 text-center hover:border-green-500 transition-colors cursor-pointer bg-gray-50/50">
                      <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center mx-auto mb-4 shadow-sm">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                        </svg>
                      </div>
                      <p className="text-sm font-bold text-gray-700 mb-1">فایل‌های خود را اینجا رها کنید یا کلیک کنید</p>
                      <p className="text-xs text-gray-500">PDF, JPG, PNG (حداکثر ۵ مگابایت)</p>
                    </div>
                  </div>
                </div>
                <div className="pt-4 border-t border-gray-100 flex gap-4">
                  <button type="submit" className="bg-green-600 text-white px-8 py-3 rounded-xl font-bold hover:bg-green-700 transition-colors text-sm">
                    ذخیره تغییرات
                  </button>
                  <button type="button" onClick={() => setActiveTab('requests')} className="bg-gray-100 text-gray-700 px-8 py-3 rounded-xl font-bold hover:bg-gray-200 transition-colors text-sm">
                    انصراف
                  </button>
                </div>
              </form>
            </motion.div>
          )}
          
          <div className="lg:col-span-2 space-y-6">`;

code = code.replace(
  /<div className="lg:col-span-2 space-y-6">/,
  profileTabHtml
);

// We should hide the other panels if activeTab === 'profile'.
// Let's modify the condition for lg:col-span-2 container
code = code.replace(
  /<div className="lg:col-span-2 space-y-6">/,
  `{activeTab !== 'profile' && (<div className="lg:col-span-2 space-y-6">`
);

// We need to close the curly brace after the `<div className="lg:col-span-2 space-y-6">` ... `</div>`
code = code.replace(
  /<\/div>\n                    <div className="space-y-6">/,
  `</div>\n          )}\n          <div className="space-y-6">`
);


fs.writeFileSync('src/pages/technician/Dashboard.tsx', code);

