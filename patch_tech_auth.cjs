const fs = require('fs');
let code = fs.readFileSync('src/pages/TechnicianAuth.tsx', 'utf-8');

code = code.replace(
  /navigate\('\/smart-maintenance'\);/g,
  "navigate('/technician-dashboard');"
);

fs.writeFileSync('src/pages/TechnicianAuth.tsx', code);
