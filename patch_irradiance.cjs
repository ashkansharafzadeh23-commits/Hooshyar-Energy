const fs = require('fs');
let code = fs.readFileSync('api/lib/solarIrradiance.js', 'utf8');

// Modify return cached
code = code.replace(
  "return { sunHours: cached.sunHours, source: 'nasa_power_api_cached' };",
  "return { sunHours: cached.sunHours, monthlySunHours: cached.monthlySunHours, source: 'nasa_power_api_cached' };"
);

// Extract monthly data
const extractDataStr = `
    const json = await response.json();
    const ann = json.properties.parameter.ALLSKY_SFC_SW_DWN.ANN;
    
    // Extract monthly
    const monthlySunHours = {};
    const months = ['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN', 'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC'];
    months.forEach((m, idx) => {
      monthlySunHours[idx + 1] = json.properties.parameter.ALLSKY_SFC_SW_DWN[m];
    });

    db.setCityIrradianceCache({
      city,
      sunHours: ann,
      monthlySunHours,
      fetchedAt: Date.now(),
      coords,
    });
    return { sunHours: ann, monthlySunHours, source: 'nasa_power_api' };
`;

code = code.replace(
  /const json = await response\.json\(\);\s*const sunHours = json\.properties\.parameter\.ALLSKY_SFC_SW_DWN\.ANN;\s*db\.setCityIrradianceCache\({[\s\S]*?}\);\s*return { sunHours, source: 'nasa_power_api' };/,
  extractDataStr
);

// Modify fallback
code = code.replace(
  "return { sunHours: fallbackRegionalEstimate(city), source: 'regional_estimate_fallback' };",
  "return { sunHours: fallbackRegionalEstimate(city), monthlySunHours: null, source: 'regional_estimate_fallback' };"
);
code = code.replace(
  "return { sunHours: fallbackRegionalEstimate(city), source: 'regional_estimate_fallback_after_error' };",
  "return { sunHours: fallbackRegionalEstimate(city), monthlySunHours: null, source: 'regional_estimate_fallback_after_error' };"
);

fs.writeFileSync('api/lib/solarIrradiance.js', code);
