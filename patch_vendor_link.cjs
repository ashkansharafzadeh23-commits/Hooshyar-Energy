const fs = require('fs');
let code = fs.readFileSync('src/pages/VendorsList.tsx', 'utf-8');

code = code.replace(
  /to="\/technician-registration" className="w-full bg-green-600 text-white font-bold py-3 rounded-xl hover:bg-green-700 transition-colors flex items-center justify-center gap-2"/,
  "to=\"/technicians-list\" className=\"w-full bg-green-600 text-white font-bold py-3 rounded-xl hover:bg-green-700 transition-colors flex items-center justify-center gap-2\""
);

code = code.replace(
  /ثبت نام کارشناسان/,
  "مشاهده کارشناسان و تعمیرکاران"
);

fs.writeFileSync('src/pages/VendorsList.tsx', code);
