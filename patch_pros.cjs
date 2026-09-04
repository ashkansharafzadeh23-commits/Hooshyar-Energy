const fs = require('fs');
let content = fs.readFileSync('src/api/professionals.ts', 'utf-8');

content = content.replace(
  'certifications: certifications || [],',
  'certifications: certifications || [],\n    rating: null,'
);

fs.writeFileSync('src/api/professionals.ts', content);
