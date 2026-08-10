const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf-8');

if (!code.includes("import UserDashboard")) {
    code = code.replace("import CustomerLogin from './pages/CustomerLogin';", "import CustomerLogin from './pages/CustomerLogin';\nimport UserDashboard from './pages/UserDashboard';");
}

if (!code.includes('<Route path="/user-dashboard"')) {
    code = code.replace('<Route path="/customer-login" element={<CustomerLogin />} />', 
                        '<Route path="/customer-login" element={<CustomerLogin />} />\n            <Route path="/user-dashboard" element={<UserDashboard />} />');
}

fs.writeFileSync('src/App.tsx', code);
