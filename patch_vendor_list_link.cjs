const fs = require('fs');
let code = fs.readFileSync('src/pages/VendorsList.tsx', 'utf-8');

const oldLink = '<Link to="/contractors" className="bg-white rounded-3xl p-8 border border-gray-200 shadow-sm hover:shadow-xl hover:border-amber-500 transition-all flex flex-col items-center text-center group relative overflow-hidden">';
const newLink = '<Link to="/contractor-auth" className="bg-white rounded-3xl p-8 border border-gray-200 shadow-sm hover:shadow-xl hover:border-amber-500 transition-all flex flex-col items-center text-center group relative overflow-hidden">';

code = code.replace(oldLink, newLink);

const oldText1 = 'مشاهده لیست شرکت‌های معتبر (EPC) برای احداث نیروگاه‌های خورشیدی.';
const newText1 = 'مخصوص شرکت‌های مجری و پیمانکاران احداث نیروگاه جهت ثبت‌نام و فعالیت.';

code = code.replace(oldText1, newText1);

const oldText2 = '<Building2 size={20} />\n            مشاهده شرکت‌ها';
const newText2 = '<LogIn size={20} />\n            ورود / ثبت‌نام';

code = code.replace(oldText2, newText2);

const oldTitle = '<h2 className="text-2xl font-bold mb-3 z-10 text-gray-800">شرکت‌های احداث نیروگاه</h2>';
const newTitle = '<h2 className="text-2xl font-bold mb-3 z-10 text-gray-800">ورود شرکت‌های EPC</h2>';
code = code.replace(oldTitle, newTitle);

fs.writeFileSync('src/pages/VendorsList.tsx', code);
