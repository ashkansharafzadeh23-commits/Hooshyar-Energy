const fs = require('fs');
let content = fs.readFileSync('src/pages/Result.tsx', 'utf-8');

content = content.replace(
  '{result.dailyConsumptionEstimate.dailyKwh.toFixed(1)}',
  '{result?.dailyConsumptionEstimate?.dailyKwh?.toFixed(1) || 0}'
);

content = content.replace(
  '{result.dailyConsumptionEstimate.monthlyKwh.toFixed(1)}',
  '{result?.dailyConsumptionEstimate?.monthlyKwh?.toFixed(1) || 0}'
);

fs.writeFileSync('src/pages/Result.tsx', content);
