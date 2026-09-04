const fs = require('fs');
let code = fs.readFileSync('src/layouts/MainLayout.tsx', 'utf8');

code = code.replace(
  "import { Search, LogIn, Sun, ShoppingCart, FileText, Settings, UserPlus, LayoutDashboard, Wrench, Home, Warehouse, Factory, Tractor } from 'lucide-react';",
  "import { Search, LogIn, Sun, ShoppingCart, FileText, Settings, UserPlus, LayoutDashboard, Wrench, Home, Warehouse, Factory, Tractor, Layers } from 'lucide-react';"
);

code = code.replace(
  "if (location.pathname.startsWith('/powerplant-setup')) return { label: 'احداث نیروگاه', icon: <Sun size={24} />, isFlow: false };",
  "if (location.pathname.startsWith('/powerplant-setup')) return { label: 'احداث نیروگاه', icon: <Sun size={24} />, isFlow: false };\n    if (location.pathname.startsWith('/solar-assets')) return { label: 'پروژه‌های خورشیدی', icon: <Layers size={24} />, isFlow: false };\n    if (location.pathname.startsWith('/admin/solar-assets')) return { label: 'بررسی پروژه‌ها (ادمین)', icon: <Layers size={24} />, isFlow: false };"
);

code = code.replace(
  "if (location.pathname === '/user-dashboard') { navigate('/target-select'); return; }",
  "if (location.pathname === '/user-dashboard') { navigate('/target-select'); return; }\n    if (location.pathname.startsWith('/solar-assets/')) { navigate('/solar-assets'); return; }"
);

// Add Top Navigation inside header
const headerReplacement = `
            <div className="flex flex-col">
              <h1 className="text-sm sm:text-lg font-bold leading-none">{label}</h1>
              {isFlow && state.city && <span className="text-[10px] sm:text-xs opacity-80 font-medium mt-1">موقعیت: {state.city}</span>}
            </div>
          </div>
          
          <div className="hidden lg:flex items-center gap-6">
            <Link to="/solar-assets" className="text-sm font-medium hover:text-blue-600 transition-colors">پروژه‌های خورشیدی</Link>
            <Link to="/solar-assets/my-projects" className="text-sm font-medium hover:text-blue-600 transition-colors">پروژه‌های من</Link>
          </div>
`;

code = code.replace(
  /<div className="flex flex-col">[\s\S]*?<\/div>\s*<\/div>/,
  headerReplacement
);

// Add the import Link if missing
if (!code.includes("import { Link")) {
  code = "import { Link } from 'react-router-dom';\n" + code;
}

// Add the banner for solar assets pages
const mainReplacement = `
      <main className="flex-1 w-full max-w-5xl mx-auto p-4 sm:p-6">
        {(location.pathname.startsWith('/solar-assets') || location.pathname.startsWith('/admin/solar-assets')) && (
          <div className="bg-amber-100 border border-amber-300 text-amber-800 text-xs sm:text-sm px-4 py-3 rounded-lg mb-6 flex items-start gap-2 shadow-sm font-medium">
            <AlertTriangle className="shrink-0 mt-0.5 text-amber-600" size={16} />
            <p>حالت شبیه‌سازی — این بخش صرفاً برای نمایش اطلاعات پروژه است. هیچ تراکنش مالی واقعی انجام نمی‌شود.</p>
          </div>
        )}
        <Outlet />
      </main>
`;

code = code.replace(
  /<main className="flex-1 w-full max-w-5xl mx-auto p-4 sm:p-6">\s*<Outlet \/>\s*<\/main>/,
  mainReplacement
);

// Add AlertTriangle to imports if missing
code = code.replace(
  "import { Search,",
  "import { Search, AlertTriangle,"
);

fs.writeFileSync('src/layouts/MainLayout.tsx', code);
