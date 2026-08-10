const fs = require('fs');

const filesToPatch = [
  'src/pages/TechnicianAuth.tsx',
  'src/pages/VendorAuth.tsx'
];

for (const file of filesToPatch) {
  let code = fs.readFileSync(file, 'utf-8');
  if (code.includes('<AdBanner layout="inline" />')) {
    code = code.replace(
      /<AdBanner layout="inline" \/>/,
      '<AdBanner layout="card" />'
    );
    fs.writeFileSync(file, code);
  }
}
