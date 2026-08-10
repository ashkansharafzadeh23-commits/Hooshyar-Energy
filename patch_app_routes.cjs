const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf-8');

code = code.replace(
  /<Route path="\/vendors" element={<VendorsList \/>} \/>\n\s*<Route path="\/sellers" element={<SellersList \/>} \/>\n\s*<Route path="\/ads-portal" element={<AdsPortal \/>} \/>\n\s*<Route path="\/smart-maintenance" element={<SmartMaintenance \/>} \/>\n\s*<Route path="\/technician-auth" element={<TechnicianAuth \/>} \/>\n\s*<Route path="\/vendor-auth" element={<VendorAuth \/>} \/>\n\s*<Route path="\/technicians-list" element={<TechniciansList \/>} \/>/,
  "<Route path=\"/sellers\" element={<SellersList />} />"
);

code = code.replace(
  /<\/Route>\n\s*<Route path="\/vendor\/:id" element={<VendorStorefront \/>} \/>/,
  "</Route>\n          <Route path=\"/vendors\" element={<VendorsList />} />\n          <Route path=\"/ads-portal\" element={<AdsPortal />} />\n          <Route path=\"/smart-maintenance\" element={<SmartMaintenance />} />\n          <Route path=\"/technician-auth\" element={<TechnicianAuth />} />\n          <Route path=\"/vendor-auth\" element={<VendorAuth />} />\n          <Route path=\"/technicians-list\" element={<TechniciansList />} />\n          <Route path=\"/vendor/:id\" element={<VendorStorefront />} />"
);

fs.writeFileSync('src/App.tsx', code);
