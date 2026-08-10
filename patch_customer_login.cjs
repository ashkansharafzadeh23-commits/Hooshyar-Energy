const fs = require('fs');
let code = fs.readFileSync('src/pages/CustomerLogin.tsx', 'utf-8');
code = code.replace("navigate('/target-select');", "navigate('/user-dashboard');");
fs.writeFileSync('src/pages/CustomerLogin.tsx', code);
