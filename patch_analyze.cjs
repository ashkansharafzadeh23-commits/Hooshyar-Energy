const fs = require('fs');
let code = fs.readFileSync('api/analyze.js', 'utf8');

code = code.replace(
  'const { sunHours, source: sunHoursSource } = await getSunHoursForCity(city);',
  'const { sunHours, monthlySunHours, source: sunHoursSource } = await getSunHoursForCity(city);'
);

code = code.replace(
  '    engineResult.dataSource = {\n      sunHours,\n      sunHoursSource,\n      sourceLabel\n    };',
  '    engineResult.dataSource = {\n      sunHours,\n      monthlySunHours,\n      sunHoursSource,\n      sourceLabel\n    };'
);

// We should also calculate the monthly generation array for the final chosen solar system size.
// `finalKwp` is calculated right above. We can inject it into `engineResult.solar`.
// Let's find where engineResult.solar is built:
/*
    engineResult.solar = {
      requiredKwp: +(requiredKwp).toFixed(2),
      finalKwp: +(finalKwp).toFixed(2),
      spaceConstrained,
      catalogAvailable,
      panelOptions
    };
*/
code = code.replace(
  '      catalogAvailable,\n      panelOptions\n    };',
  '      catalogAvailable,\n      panelOptions,\n      monthlyGeneration: monthlySunHours ? Object.keys(monthlySunHours).map(month => ({ month, kwh: +(finalKwp * monthlySunHours[month] * 30 * 0.775).toFixed(0) })) : []\n    };'
);

fs.writeFileSync('api/analyze.js', code);
