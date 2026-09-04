const fs = require('fs');
let code = fs.readFileSync('src/components/MonthlyGenerationChart.tsx', 'utf8');

code = code.replace(
  'key={\\`cell-\\${index}\\`}',
  'key={`cell-${index}`}'
);

fs.writeFileSync('src/components/MonthlyGenerationChart.tsx', code);
