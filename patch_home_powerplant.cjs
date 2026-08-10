const fs = require('fs');
let code = fs.readFileSync('src/pages/Home.tsx', 'utf-8');

code = code.replace(
  /<div className="grid grid-cols-1 sm:grid-cols-3 gap-6 w-full mb-10">/,
  `<div className="w-full mb-6">
        <Link to="/powerplant-setup" className="flex items-center justify-center gap-3 bg-gradient-to-r from-amber-500 to-orange-500 text-white px-8 py-4 rounded-2xl font-bold text-xl hover:from-amber-600 hover:to-orange-600 transition-all shadow-lg hover:shadow-xl w-full transform hover:-translate-y-1">
          <Sun size={24} className="animate-pulse" />
          احداث نیروگاه برق خورشیدی (فروش برق)
        </Link>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 w-full mb-10">`
);

fs.writeFileSync('src/pages/Home.tsx', code);
