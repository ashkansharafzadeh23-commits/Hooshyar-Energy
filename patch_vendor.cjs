const fs = require('fs');

let authCode = fs.readFileSync('src/pages/VendorAuth.tsx', 'utf-8');
authCode = authCode.replace(/navigate\('\/vendor-portal'\);/g, "navigate('/vendor-portal/dashboard');");
fs.writeFileSync('src/pages/VendorAuth.tsx', authCode);

let portalCode = fs.readFileSync('src/pages/vendor/VendorPortal.tsx', 'utf-8');
portalCode = portalCode.replace(/import LoginRegister from '.\/portal\/LoginRegister';\n/, '');
portalCode = portalCode.replace(/<Route path="login" element={<LoginRegister \/>} \/>\n/, '');
portalCode = portalCode.replace(/<Route path="\/" element={<Navigate to="login" replace \/>} \/>/, '<Route path="/" element={<Navigate to="dashboard" replace />} />');
fs.writeFileSync('src/pages/vendor/VendorPortal.tsx', portalCode);

// Optional: remove LoginRegister.tsx
try {
  fs.unlinkSync('src/pages/vendor/portal/LoginRegister.tsx');
} catch(e) {}
