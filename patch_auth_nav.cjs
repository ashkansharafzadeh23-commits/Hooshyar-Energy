const fs = require('fs');
let code = fs.readFileSync('src/pages/ContractorAuth.tsx', 'utf-8');
code = code.replace("navigate('/contractors');", "navigate('/contractor-dashboard');");
fs.writeFileSync('src/pages/ContractorAuth.tsx', code);
