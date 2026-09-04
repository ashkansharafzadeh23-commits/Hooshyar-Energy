const fs = require('fs');
let content = fs.readFileSync('api/analyze.js', 'utf-8');

content = content.replace(
  'summary: "تحلیل پایه بر اساس موتور قوانین انجام شد. (" + errorMsg + ")",',
  'summary: "تحلیل پایه بر اساس موتور قوانین انجام شد. (" + errorMsg + ")",\n      dailyConsumptionEstimate: engineResult.dailyConsumptionEstimate || { dailyKwh: 0, monthlyKwh: 0 },'
);

fs.writeFileSync('api/analyze.js', content);
