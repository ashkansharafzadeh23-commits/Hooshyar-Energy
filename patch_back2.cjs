const fs = require('fs');
let code = fs.readFileSync('src/layouts/MainLayout.tsx', 'utf-8');

if (!code.includes("if (location.pathname === '/contractor-auth')")) {
    code = code.replace("if (location.pathname === '/vendor-auth') { navigate('/target-select'); return; }",
                        "if (location.pathname === '/vendor-auth') { navigate('/target-select'); return; }\n    if (location.pathname === '/contractor-auth') { navigate('/target-select'); return; }");
    
    // Also handle /contractors page back routing if needed
    code = code.replace("if (location.pathname === '/technicians-list') { navigate('/vendors'); return; }",
                        "if (location.pathname === '/technicians-list') { navigate('/vendors'); return; }\n    if (location.pathname === '/contractors') { navigate(-1); return; }");
    
    fs.writeFileSync('src/layouts/MainLayout.tsx', code);
}
