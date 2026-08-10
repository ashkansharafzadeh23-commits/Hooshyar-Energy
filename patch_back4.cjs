const fs = require('fs');
let code = fs.readFileSync('src/layouts/MainLayout.tsx', 'utf-8');

if (!code.includes("if (location.pathname === '/user-dashboard')")) {
    code = code.replace("if (location.pathname === '/contractor-dashboard') { navigate('/vendors'); return; }",
                        "if (location.pathname === '/contractor-dashboard') { navigate('/vendors'); return; }\n    if (location.pathname === '/user-dashboard') { navigate('/customer-login'); return; }");
    fs.writeFileSync('src/layouts/MainLayout.tsx', code);
}
