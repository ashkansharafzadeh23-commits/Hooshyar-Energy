const fs = require('fs');
let code = fs.readFileSync('src/pages/SmartMaintenance.tsx', 'utf-8');

if (!code.includes('useNavigate')) {
  code = code.replace(/import { Link } from "react-router-dom";/, 'import { Link, useNavigate } from "react-router-dom";');
}

code = code.replace(
  /export default function SmartMaintenance\(\) \{/,
  'export default function SmartMaintenance() {\n  const navigate = useNavigate();'
);

code = code.replace(
  /<Link to="\/" className="inline-flex items-center gap-2 text-\[#5A6072\] hover:text-\[#1A1D23\] text-sm">\s*<ArrowLeft size=\{16\} \/>\s*بازگشت\s*<\/Link>/,
  '<button onClick={() => navigate(-1)} className="inline-flex items-center gap-2 text-[#5A6072] hover:text-[#1A1D23] text-sm">\n            <ArrowLeft size={16} />\n            بازگشت به صفحه قبل\n          </button>'
);

fs.writeFileSync('src/pages/SmartMaintenance.tsx', code);
