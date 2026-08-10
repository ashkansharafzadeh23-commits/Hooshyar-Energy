const fs = require('fs');
let code = fs.readFileSync('server.ts', 'utf-8');

const oldCode = `    res.json({ analysis: analysisText });`;

const newCode = `    const numArea = parseFloat(area) || 0;
    const numBudget = parseFloat(budget) || 0;
    
    const possibleCapacityByBudget = numBudget / 30;
    const possibleCapacityByArea = numArea / 10;
    const capacityKw = Math.max(0, Math.min(possibleCapacityByBudget, possibleCapacityByArea));
    const actualInvestment = capacityKw * 30;
    
    const financialData = [];
    let cumulativeProfit = -actualInvestment;
    
    for (let year = 1; year <= 10; year++) {
      const annualGenerationKwh = capacityKw * 1800 * Math.pow(0.99, year - 1);
      const revenue = (annualGenerationKwh * 3000) / 1000000;
      const maintenanceCost = actualInvestment * 0.02 * Math.pow(1.15, year - 1);
      
      const netProfit = revenue - maintenanceCost;
      cumulativeProfit += netProfit;
      
      financialData.push({
        year: \`سال \${year}\`,
        revenue: Math.round(revenue),
        maintenance: Math.round(maintenanceCost),
        netProfit: Math.round(netProfit),
        cumulativeProfit: Math.round(cumulativeProfit)
      });
    }

    res.json({ analysis: analysisText, financialData });`;

if (code.includes(oldCode)) {
  code = code.replace(oldCode, newCode);
  fs.writeFileSync('server.ts', code);
  console.log("Patched server.ts successfully");
} else {
  console.log("Could not find the target code in server.ts");
}
