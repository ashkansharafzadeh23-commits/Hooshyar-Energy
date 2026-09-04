const fs = require('fs');
let content = fs.readFileSync('api/analyze.js', 'utf-8');

const startIndex = content.indexOf('// 3.3 فراخوانی Claude API');
if (startIndex !== -1) {
  content = content.substring(0, startIndex);
  content += `// 3.3 فراخوانی Claude API
  const generateFallback = (errorMsg) => {
    return {
      summary: "تحلیل پایه بر اساس موتور قوانین انجام شد. (" + errorMsg + ")",
      solar: engineResult.solar || {},
      generator: engineResult.generator || {},
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
    
    const jsonMatch = textContent.match(/\\{[\\s\\S]*\\}/);
    if (jsonMatch) {
      textContent = jsonMatch[0];
    } else {
      if (textContent.startsWith('\`\`\`json')) {
        textContent = textContent.replace(/\`\`\`json\\n?/, '').replace(/\`\`\`$/, '');
      } else if (textContent.startsWith('\`\`\`')) {
        textContent = textContent.replace(/\`\`\`\\n?/, '').replace(/\`\`\`$/, '');
      }
    }
    
    const finalResult = JSON.parse(textContent);
    return res.status(200).json(finalResult);
    
  } catch (err) {
    console.error("Analysis Error:", err);
    return res.status(200).json(generateFallback("خطا در پردازش هوش مصنوعی (فرمت نامعتبر)"));
  }
}
`;
  fs.writeFileSync('api/analyze.js', content);
}
