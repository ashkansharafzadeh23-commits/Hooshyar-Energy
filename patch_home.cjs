const fs = require('fs');
let code = fs.readFileSync('src/pages/Home.tsx', 'utf-8');

const targetImport = "import { Sun, Zap, BatteryCharging, ArrowLeft } from 'lucide-react';";
code = code.replace(targetImport, "import { Sun, Zap, BatteryCharging, ArrowLeft, LayoutDashboard } from 'lucide-react';");

const userDashboardButton = `
      <div className="w-full mb-6">
        <Link to="/user-dashboard" className="flex items-center justify-center gap-3 bg-white text-blue-600 border-2 border-blue-600 px-8 py-4 rounded-2xl font-bold text-xl hover:bg-blue-50 transition-all shadow-lg hover:shadow-xl w-full transform hover:-translate-y-1">
          <LayoutDashboard size={24} />
          ورود به داشبورد کاربری من (پیگیری درخواست‌ها)
        </Link>
      </div>
`;

code = code.replace('<div className="mt-8 mb-4 w-full">', userDashboardButton + '      <div className="mt-8 mb-4 w-full">');

fs.writeFileSync('src/pages/Home.tsx', code);
