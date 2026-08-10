const fs = require('fs');
let content = fs.readFileSync('src/pages/AdsPortal.tsx', 'utf-8');
content = content.replace(/<Link to="\/vendors".*?>[\s\S]*?بازگشت به همکاران[\s\S]*?<\/Link>/g, '');
fs.writeFileSync('src/pages/AdsPortal.tsx', content);

let content2 = fs.readFileSync('src/pages/TechniciansList.tsx', 'utf-8');
content2 = content2.replace(/<Link to="\/vendors".*?>[\s\S]*?بازگشت به همکاران[\s\S]*?<\/Link>/g, '');
fs.writeFileSync('src/pages/TechniciansList.tsx', content2);
