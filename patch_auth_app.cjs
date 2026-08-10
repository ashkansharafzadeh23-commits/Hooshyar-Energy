const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf-8');

if (!code.includes("import ContractorAuth")) {
    code = code.replace("import ContractorsList from './pages/ContractorsList';", "import ContractorsList from './pages/ContractorsList';\nimport ContractorAuth from './pages/ContractorAuth';");
}

if (!code.includes('<Route path="/contractor-auth"')) {
    code = code.replace('<Route path="/contractors" element={<ContractorsList />} />', 
                        '<Route path="/contractors" element={<ContractorsList />} />\n            <Route path="/contractor-auth" element={<ContractorAuth />} />');
}

fs.writeFileSync('src/App.tsx', code);
