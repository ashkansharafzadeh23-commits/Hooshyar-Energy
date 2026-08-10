const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf-8');

if (!code.includes("import ContractorsList")) {
    code = code.replace("import VendorsList", "import ContractorsList from './pages/ContractorsList';\nimport VendorsList");
}

if (!code.includes('<Route path="/contractors"')) {
    code = code.replace('<Route path="/vendors" element={<VendorsList />} />', 
                        '<Route path="/vendors" element={<VendorsList />} />\n            <Route path="/contractors" element={<ContractorsList />} />');
}

fs.writeFileSync('src/App.tsx', code);
