import { getSunHoursForCity } from './lib/solarIrradiance.js';

export async function runRuleEngine(body) {
  const req = { body }; // mock req for compatibility
  let resError = null;
  const res = {
    status: (code) => ({
      json: (data) => { resError = { status: code, data }; return resError; }
    })
  };

  // 3.1 اعتبارسنجی ورودی
    const { targets, locationType, appliances, actualMonthlyKwh, area, city } = req.body;
    
    if (!area || area <= 0 || !locationType) {
      return res.status(400).json({ error: "insufficient_data", missingInfo: ["area", "locationType"] });
    }
  
    // 3.2 Rule Engine - محاسبات قطعی
    let dailyKwh = 0;
    
    if (actualMonthlyKwh && actualMonthlyKwh > 0) {
      dailyKwh = actualMonthlyKwh / 30;
    } else if (appliances && appliances.length > 0) {
      let rawDaily = 0;
      for (const app of appliances) {
        rawDaily += (app.watt / 1000) * app.quantity * app.hours;
      }
      let diversityFactor = 0.6; // residential
      if (locationType === 'industrial_warehouse') diversityFactor = 0.7;
      if (locationType === 'factory') diversityFactor = 0.75;
      if (locationType === 'agricultural') diversityFactor = 0.8;
      dailyKwh = rawDaily * diversityFactor;
    } else {
      // تخمین متراژی
      if (locationType === 'residential') {
        dailyKwh = (area / 100) * 20;
      } else if (locationType === 'industrial_warehouse') {
        dailyKwh = (area / 100) * 40;
      } else if (locationType === 'factory') {
        return res.status(400).json({ error: "insufficient_data", missingInfo: ["appliances", "actualMonthlyKwh"] });
      } else if (locationType === 'agricultural') {
        dailyKwh = 50; // بر اساس توان پمپ (پیشفرض)
      }
    }
  
    const engineResult = {
      dailyConsumptionEstimate: {
        dailyKwh: +(dailyKwh).toFixed(2),
        monthlyKwh: +(dailyKwh * 30).toFixed(2)
      }
    };
  
    const isSolar = targets && targets.includes("solar");
    const isGenerator = targets && targets.includes("generator");
  
    // Sun hours mapping via NASA POWER API
    const { sunHours, monthlySunHours, source: sunHoursSource } = await getSunHoursForCity(city);
  
    let sourceLabel = "داده تابش خورشیدی ماهواره‌ای NASA POWER (میانگین ۲۲ ساله)";
    if (sunHoursSource !== "nasa_power_api" && sunHoursSource !== "nasa_power_api_cached") {
      sourceLabel = "تخمین تقریبی منطقه‌ای (داده دقیق ماهواره‌ای برای این شهر هنوز ثبت نشده)";
    }
  
    if (isSolar) {
      const requiredKwp = dailyKwh / (sunHours * 0.775);
      const usableAreaM2 = area * 0.75; // اگر پشت‌بام باشد. اینجا فرض می‌کنیم همیشه ۷۵٪
      const maxKwpBySpace = usableAreaM2 / 6.5;
      
      let spaceConstrained = false;
      let finalKwp = requiredKwp;
      
      if (requiredKwp > maxKwpBySpace) {
        finalKwp = maxKwpBySpace;
        spaceConstrained = true;
      }
  
      let catalogPanels = req.body.catalogPanels || [];
      let panelOptions = [];
      let catalogAvailable = catalogPanels.length > 0;
  
      if (catalogAvailable) {
        const estimatePanelArea = (p) => (p.widthM && p.heightM) ? p.widthM * p.heightM : (p.powerWatt / 1000) * 1.95;
        
        const evaluatedOptions = catalogPanels.map(panel => {
          const pArea = estimatePanelArea(panel);
          const idealCount = Math.ceil((finalKwp * 1000) / panel.powerWatt);
          const maxBySpace = Math.floor(usableAreaM2 / pArea);
          const pSpaceConstrained = idealCount > maxBySpace;
          const count = pSpaceConstrained ? maxBySpace : idealCount;
          
          return {
            productId: panel.id,
            panelWattage: panel.powerWatt,
            panelCount: count,
            actualSystemKwp: +(count * panel.powerWatt / 1000).toFixed(2),
            requiredAreaM2: +(count * pArea).toFixed(1),
            spaceConstrained: pSpaceConstrained,
            totalCost: count * panel.price,
            costPerWatt: +(panel.price / panel.powerWatt).toFixed(0),
            wattPerM2: +(panel.powerWatt / pArea).toFixed(0),
            panel: panel
          };
        });
  
        // Remove duplicates (same productId)
        const uniqueOptions = [];
        const seen = new Set();
        for (const opt of evaluatedOptions) {
          if (!seen.has(opt.productId)) {
            seen.add(opt.productId);
            uniqueOptions.push(opt);
          }
        }
  
        if (uniqueOptions.length > 0) {
          // economy = کمترین totalCost
          const economy = [...uniqueOptions].sort((a, b) => a.totalCost - b.totalCost)[0];
          // balanced = کمترین costPerWatt
          const balanced = [...uniqueOptions].sort((a, b) => a.costPerWatt - b.costPerWatt)[0];
          // spaceSaving = بیشترین wattPerM2
          const spaceSaving = [...uniqueOptions].sort((a, b) => b.wattPerM2 - a.wattPerM2)[0];
  
          panelOptions = { economy, balanced, spaceSaving };
        }
      } else {
        // مقدار پیش‌فرض 550 وات
        const count = Math.ceil((finalKwp * 1000) / 550);
        panelOptions = {
          default: { panelWattage: 550, panelCount: count, actualSystemKwp: +(count * 550 / 1000).toFixed(2) }
        };
      }
  
      engineResult.solar = {
        requiredKwp: +(requiredKwp).toFixed(2),
        finalKwp: +(finalKwp).toFixed(2),
        spaceConstrained,
        catalogAvailable,
        panelOptions
      };
    }
  
    console.log("Adding monthlySunHours to dataSource:", monthlySunHours);
    engineResult.dataSource = {
      sunHours,
      monthlySunHours,
      sunHoursSource,
      sourceLabel
    };
  
    if (isGenerator) {
      let totalKw = 0;
      let maxMotorKw = 0;
      let isThreePhase = false;
  
      if (appliances && appliances.length > 0) {
        for (const app of appliances) {
          const kw = app.watt / 1000;
          totalKw += kw * app.quantity;
          if (kw > maxMotorKw) maxMotorKw = kw;
        }
      } else if (dailyKwh > 0) {
         totalKw = dailyKwh / 10; // rough estimate of peak load
      }
  
      if (locationType === 'factory' && (!appliances || appliances.length === 0)) {
         return res.status(400).json({ error: "insufficient_data", missingInfo: ["factoryMotors"] });
      }
  
      const stableKva = totalKw / 0.8;
      
      // فاز
      if (stableKva > 15 || locationType === 'factory' || locationType === 'industrial_warehouse') {
        isThreePhase = true;
      }
  
      const startMultiplier = isThreePhase ? 6 : 3;
      const startupKw = (maxMotorKw * startMultiplier) + (totalKw - maxMotorKw);
      const startupKva = startupKw / 0.8;
  
      const finalKva = Math.max(stableKva, startupKva) * 1.275;
      
      const fuelType = (locationType === 'factory' || locationType === 'industrial_warehouse') ? 'diesel' : 'petrol';
      const atsRequired = (req.body.gridConnected !== false) && (locationType === 'factory' || locationType === 'industrial_warehouse');
  
      engineResult.generator = {
        stableKva: +(stableKva).toFixed(2),
        startupKva: +(startupKva).toFixed(2),
        finalKva: +(finalKva).toFixed(2),
        phase: isThreePhase ? '3-phase' : '1-phase',
        fuelType,
        atsRequired
      };
    }
  
    const catalogAccessories = req.body.catalogAccessories || [];
    let requiredAccessories = [];
    
    if (isSolar) {
      const accList = ['اینورتر', 'سازه نصب', 'کابل DC', 'کانکتور MC4', 'کلید قطع DC/AC', 'SPD'];
      accList.forEach(name => {
        const match = catalogAccessories.find(a => a.name === name);
        requiredAccessories.push({
          name,
          availableInCatalog: !!match,
          matchedProductId: match ? match.id : null,
          estimatedPrice: match ? match.price : null
        });
      });
    }
    
    if (isGenerator) {
      const accList = ['باتری استارت', 'پایه ضدارتعاش', 'سیستم اگزوز', 'تابلو برق'];
      if (engineResult.generator?.atsRequired) accList.push('سیستم ATS');
      
      accList.forEach(name => {
        const match = catalogAccessories.find(a => a.name === name);
        requiredAccessories.push({
          name,
          availableInCatalog: !!match,
          matchedProductId: match ? match.id : null,
          estimatedPrice: match ? match.price : null
        });
      });
    }
    
    engineResult.requiredAccessories = requiredAccessories;
  
    
  if (resError) return { error: resError };
  return { engineResult };
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: "Method not allowed" });
  }
  
  
// 3.1 اعتبارسنجی ورودی
  const ruleRes = await runRuleEngine(req.body);
  if (ruleRes.error) return res.status(ruleRes.error.status).json(ruleRes.error.data);
  const engineResult = ruleRes.engineResult;

// 3.3 فراخوانی Claude API
  const generateFallback = (errorMsg) => {
    return {
      summary: "تحلیل پایه بر اساس موتور قوانین انجام شد. (" + errorMsg + ")",
      dailyConsumptionEstimate: engineResult.dailyConsumptionEstimate || { dailyKwh: 0, monthlyKwh: 0 },
      solar: engineResult.solar || {},
      generator: engineResult.generator || {},
      dataSource: engineResult.dataSource || {},
      recommendedProducts: [],
      requiredAccessories: engineResult.requiredAccessories || [],
      estimatedTotalCost: (engineResult.solar?.estimatedTotalCost || 0) + (engineResult.generator?.estimatedTotalCost || 0),
      warnings: [
        { severity: "warning", message: "این پیشنهاد اولیه است؛ بازدید حضوری کارشناس توصیه می‌شود" },
        { severity: "error", message: errorMsg }
      ],
      missingInfo: []
    };
  };

  if (!process.env.ANTHROPIC_API_KEY) {
    console.error("ANTHROPIC_API_KEY تنظیم نشده است");
    return res.status(200).json(generateFallback("ANTHROPIC_API_KEY تنظیم نشده است"));
  }

  try {
    const claudeRes = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': process.env.ANTHROPIC_API_KEY,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: 'claude-3-5-sonnet-20240620',
        max_tokens: 2000,
        system: SYSTEM_PROMPT,
        messages: [{ role: 'user', content: JSON.stringify({ ruleEngineResult: engineResult, catalog: { panels: req.body.catalogPanels, accessories: req.body.catalogAccessories } }) }],
      }),
    });

    if (!claudeRes.ok) {
      const errorText = await claudeRes.text();
      console.error("Claude API error:", errorText);
      return res.status(200).json(generateFallback("خطا در ارتباط با هوش مصنوعی (Claude API)"));
    }

    const claudeData = await claudeRes.json();
    let textContent = claudeData.content[0].text;
    
    const jsonMatch = textContent.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      textContent = jsonMatch[0];
    } else {
      if (textContent.startsWith('```json')) {
        textContent = textContent.replace(/```json\n?/, '').replace(/```$/, '');
      } else if (textContent.startsWith('```')) {
        textContent = textContent.replace(/```\n?/, '').replace(/```$/, '');
      }
    }
    
    const finalResult = JSON.parse(textContent);
    finalResult.dataSource = engineResult.dataSource;
    return res.status(200).json(finalResult);
    
  } catch (err) {
    console.error("Analysis Error:", err);
    return res.status(200).json(generateFallback("خطا در پردازش هوش مصنوعی (فرمت نامعتبر)"));
  }
}
