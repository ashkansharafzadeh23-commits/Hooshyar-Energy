const fs = require('fs');
let content = fs.readFileSync('src/pages/Result.tsx', 'utf-8');

content = content.replace(
  /result\.dailyConsumptionEstimate\.monthlyKwh/g,
  '(result?.dailyConsumptionEstimate?.monthlyKwh || 0)'
);

fs.writeFileSync('src/pages/Result.tsx', content);
