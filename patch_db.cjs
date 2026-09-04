const fs = require('fs');
let code = fs.readFileSync('src/db/index.ts', 'utf8');

code = code.replace(
  '  fetchedAt: number;\n}',
  '  fetchedAt: number;\n  monthlySunHours?: Record<string, number>;\n}'
);

fs.writeFileSync('src/db/index.ts', code);
