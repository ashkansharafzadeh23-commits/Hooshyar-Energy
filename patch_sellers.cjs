const fs = require('fs');
let code = fs.readFileSync('src/pages/SellersList.tsx', 'utf-8');

code = code.replace(
  /<div className="flex gap-2">\s*<Link to="\/technician-registration"[\s\S]*?ورود همکاران\s*<\/Link>\s*<\/div>/g,
  ''
);

fs.writeFileSync('src/pages/SellersList.tsx', code);
