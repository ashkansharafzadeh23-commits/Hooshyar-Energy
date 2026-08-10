const fs = require('fs');
let code = fs.readFileSync('src/pages/Result.tsx', 'utf-8');

code = code.replace("import EnergyEfficiencyChart from '../components/EnergyEfficiencyChart';", "import EnergyEfficiencyChart from '../components/EnergyEfficiencyChart';\nimport { SmartWarning } from '../components/SmartWarning';");

const targetStr = `        {state.targets.includes('solar') && (
          <EnergyEfficiencyChart 
            monthlyConsumption={result.dailyConsumptionEstimate.monthlyKwh}
            monthlyGeneration={result.dailyConsumptionEstimate.monthlyKwh * 1.15}
          />
        )}`;

const replacement = `        {state.targets.includes('solar') && (
          <EnergyEfficiencyChart 
            monthlyConsumption={result.dailyConsumptionEstimate.monthlyKwh}
            monthlyGeneration={result.dailyConsumptionEstimate.monthlyKwh * 1.15}
          />
        )}
      </div>

      <SmartWarning 
        monthlyKwh={result.dailyConsumptionEstimate.monthlyKwh} 
        targets={state.targets} 
      />`;

code = code.replace(targetStr + "\n      </div>", replacement);

fs.writeFileSync('src/pages/Result.tsx', code);
