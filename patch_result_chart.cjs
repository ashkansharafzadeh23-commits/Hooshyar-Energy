const fs = require('fs');
let code = fs.readFileSync('src/pages/Result.tsx', 'utf8');

code = code.replace(
  "{state.targets.includes('solar') && result?.solar?.monthlyGeneration && result.solar.monthlyGeneration.length > 0 && (\n          <div className=\"col-span-1 lg:col-span-12\">\n            <MonthlyGenerationChart data={result.solar.monthlyGeneration} />\n          </div>\n        )}",
  "{state.targets.includes('solar') && result?.dataSource?.monthlySunHours && result?.solar?.finalKwp && (\n          <div className=\"col-span-1 lg:col-span-12\">\n            <MonthlyGenerationChart \n              monthlySunHours={result.dataSource.monthlySunHours} \n              systemKwp={result.solar.finalKwp} \n            />\n          </div>\n        )}"
);

fs.writeFileSync('src/pages/Result.tsx', code);
