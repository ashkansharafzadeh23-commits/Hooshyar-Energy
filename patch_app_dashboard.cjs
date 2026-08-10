const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf-8');

if (!code.includes("import ContractorDashboard")) {
    code = code.replace("import ContractorAuth from './pages/ContractorAuth';", "import ContractorAuth from './pages/ContractorAuth';\nimport ContractorDashboard from './pages/ContractorDashboard';");
}

if (!code.includes('<Route path="/contractor-dashboard"')) {
    code = code.replace('<Route path="/contractor-auth" element={<ContractorAuth />} />', 
                        '<Route path="/contractor-auth" element={<ContractorAuth />} />\n            <Route path="/contractor-dashboard" element={<ContractorDashboard />} />');
}

fs.writeFileSync('src/App.tsx', code);
