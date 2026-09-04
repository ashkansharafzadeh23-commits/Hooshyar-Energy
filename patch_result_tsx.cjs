const fs = require('fs');
let content = fs.readFileSync('src/pages/Result.tsx', 'utf-8');

content = content.replace(
  '{result.technicalSpecs.map',
  '{(result.technicalSpecs || []).map'
);

content = content.replace(
  'monthlyConsumption={result.dailyConsumptionEstimate.monthlyKwh}',
  'monthlyConsumption={result?.dailyConsumptionEstimate?.monthlyKwh || 0}'
);

content = content.replace(
  'monthlyGeneration={result.dailyConsumptionEstimate.monthlyKwh * 1.15}',
  'monthlyGeneration={(result?.dailyConsumptionEstimate?.monthlyKwh || 0) * 1.15}'
);

content = content.replace(
  'monthlyKwh={result.dailyConsumptionEstimate.monthlyKwh}',
  'monthlyKwh={result?.dailyConsumptionEstimate?.monthlyKwh || 0}'
);

fs.writeFileSync('src/pages/Result.tsx', content);
