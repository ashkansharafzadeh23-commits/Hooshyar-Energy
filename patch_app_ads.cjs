const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf-8');

code = code.replace(
  /import SellersList from '.\/pages\/SellersList';/,
  "import SellersList from './pages/SellersList';\nimport AdsPortal from './pages/AdsPortal';"
);

code = code.replace(
  /<Route path="\/sellers" element=\{<SellersList \/>\} \/>/,
  '<Route path="/sellers" element={<SellersList />} />\n            <Route path="/ads-portal" element={<AdsPortal />} />'
);

fs.writeFileSync('src/App.tsx', code);
