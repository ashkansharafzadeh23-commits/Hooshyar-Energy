const fs = require('fs');
let code = fs.readFileSync('src/pages/Result.tsx', 'utf-8');

// Import the chart component
if (!code.includes('EnergyEfficiencyChart')) {
  code = code.replace(
    /import SavingsCalculator from '\.\.\/components\/SavingsCalculator';/,
    "import SavingsCalculator from '../components/SavingsCalculator';\nimport EnergyEfficiencyChart from '../components/EnergyEfficiencyChart';"
  );
}

// Check where to insert the chart
// It's a col-span-12 section, we can put it inside the grid after the energy saving tips.
// But wait, if the grid has 12 columns, and we add a col-span-12 element, it will naturally take up a new row!
// Let's replace `</section>\n      </div>\n    </motion.div>` with `</section>\n        <EnergyEfficiencyChart monthlyConsumption={result.dailyConsumptionEstimate.monthlyKwh} monthlyGeneration={result.dailyConsumptionEstimate.monthlyKwh * 1.05} />\n      </div>\n    </motion.div>`

if (code.includes('</section>\n      </div>\n    </motion.div>')) {
  code = code.replace(
    /<\/section>\s*<\/div>\s*<\/motion.div>/,
    `</section>\n        {state.targets.includes('solar') && (\n          <EnergyEfficiencyChart \n            monthlyConsumption={result.dailyConsumptionEstimate.monthlyKwh} \n            monthlyGeneration={result.dailyConsumptionEstimate.monthlyKwh * 1.15} \n          />\n        )}\n      </div>\n    </motion.div>`
  );
} else {
  // Try another approach
  code = code.replace(
    /<\/section>\s*<\/div>\s*<\/motion\.div>/g,
    `</section>\n        {state.targets.includes('solar') && (\n          <EnergyEfficiencyChart \n            monthlyConsumption={result.dailyConsumptionEstimate.monthlyKwh} \n            monthlyGeneration={result.dailyConsumptionEstimate.monthlyKwh * 1.15} \n          />\n        )}\n      </div>\n    </motion.div>`
  );
}

fs.writeFileSync('src/pages/Result.tsx', code);
