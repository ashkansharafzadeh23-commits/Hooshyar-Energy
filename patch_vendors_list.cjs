const fs = require('fs');
let code = fs.readFileSync('src/pages/VendorsList.tsx', 'utf-8');

if (!code.includes('ArrowLeft')) {
  code = code.replace(
    /import { Store, UserCircle, Megaphone, LogIn } from 'lucide-react';/,
    "import { Store, UserCircle, Megaphone, LogIn, ArrowLeft } from 'lucide-react';"
  );
  
  const headerCode = `
      <div className="w-full mb-6">
        <Link to="/" className="inline-flex items-center gap-2 text-[#5A6072] hover:text-[#1A1D23] font-medium transition-colors bg-white px-4 py-2 rounded-xl shadow-sm border border-[#E4E7EC] hover:shadow-md">
          <ArrowLeft size={18} />
          بازگشت به صفحه اصلی
        </Link>
      </div>
      <div className="text-center mb-12">`;
      
  code = code.replace(
    /<div className="text-center mb-12">/,
    headerCode
  );

  fs.writeFileSync('src/pages/VendorsList.tsx', code);
}
