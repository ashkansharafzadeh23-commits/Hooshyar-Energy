const fs = require('fs');
let code = fs.readFileSync('api/analyze.js', 'utf8');

code = code.replace(
  'engineResult.dataSource = {',
  'console.log("Adding monthlySunHours to dataSource:", monthlySunHours);\n    engineResult.dataSource = {'
);

fs.writeFileSync('api/analyze.js', code);
