const fs = require('fs');
let code = fs.readFileSync('src/api/assets.ts', 'utf8');

code = code.replace(/req\.params\.id/g, '(req.params.id as string)');

fs.writeFileSync('src/api/assets.ts', code);
