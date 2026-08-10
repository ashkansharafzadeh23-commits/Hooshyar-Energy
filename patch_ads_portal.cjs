const fs = require('fs');
let code = fs.readFileSync('src/pages/AdsPortal.tsx', 'utf-8');

code = code.replace(/۱,۵۰۰,۰۰۰/g, '۱۰,۰۰۰,۰۰۰');
code = code.replace(/۳,۰۰۰,۰۰۰/g, '۱۵,۰۰۰,۰۰۰');
code = code.replace(/۶,۵۰۰,۰۰۰/g, '۲۰,۰۰۰,۰۰۰');

fs.writeFileSync('src/pages/AdsPortal.tsx', code);
