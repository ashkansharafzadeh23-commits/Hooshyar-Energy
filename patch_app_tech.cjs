const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf-8');

if (!code.includes('TechniciansList')) {
  code = code.replace(
    /import TechnicianRegistration from '\.\/pages\/TechnicianRegistration';/,
    "import TechnicianRegistration from './pages/TechnicianRegistration';\nimport TechniciansList from './pages/TechniciansList';"
  );
  
  code = code.replace(
    /<Route path="\/technician-registration" element={<TechnicianRegistration \/>} \/>/,
    "<Route path=\"/technician-registration\" element={<TechnicianRegistration />} />\n            <Route path=\"/technicians-list\" element={<TechniciansList />} />"
  );
  fs.writeFileSync('src/App.tsx', code);
}
