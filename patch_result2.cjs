const fs = require('fs');
let code = fs.readFileSync('src/pages/Result.tsx', 'utf-8');

const targetStr = `        {state.targets.includes('solar') && (
          <EnergyEfficiencyChart 
            monthlyConsumption={result.dailyConsumptionEstimate.monthlyKwh}
            monthlyGeneration={result.dailyConsumptionEstimate.monthlyKwh * 1.15}
          />
        )}
      </div>`;

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

// simpler regex based replace
code = code.replace(/<EnergyEfficiencyChart\s+monthlyConsumption=\{result\.dailyConsumptionEstimate\.monthlyKwh\}\s+monthlyGeneration=\{result\.dailyConsumptionEstimate\.monthlyKwh \* 1\.15\}\s+\/>\s+\)}\s+<\/div>/, `<EnergyEfficiencyChart 
            monthlyConsumption={result.dailyConsumptionEstimate.monthlyKwh}
            monthlyGeneration={result.dailyConsumptionEstimate.monthlyKwh * 1.15}
          />
        )}
      </div>
      <SmartWarning 
        monthlyKwh={result.dailyConsumptionEstimate.monthlyKwh} 
        targets={state.targets} 
      />`);

fs.writeFileSync('src/pages/Result.tsx', code);
