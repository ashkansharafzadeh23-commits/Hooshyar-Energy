const fs = require('fs');
let code = fs.readFileSync('src/layouts/MainLayout.tsx', 'utf-8');

if (!code.includes("if (location.pathname === '/contractor-dashboard')")) {
    code = code.replace("if (location.pathname === '/contractors') { navigate(-1); return; }",
                        "if (location.pathname === '/contractors') { navigate(-1); return; }\n    if (location.pathname === '/contractor-dashboard') { navigate('/vendors'); return; }");
    fs.writeFileSync('src/layouts/MainLayout.tsx', code);
}
