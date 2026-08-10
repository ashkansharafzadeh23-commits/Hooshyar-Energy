const fs = require('fs');
let code = fs.readFileSync('src/pages/TechnicianRegistration.tsx', 'utf-8');

code = code.replace(
  /navigate\('\/smart-maintenance'\);/,
  "navigate('/technicians-list');"
);

fs.writeFileSync('src/pages/TechnicianRegistration.tsx', code);
