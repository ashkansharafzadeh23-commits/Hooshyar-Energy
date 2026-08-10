const fs = require('fs');
let code = fs.readFileSync('server.ts', 'utf-8');

const targetRoute = `app.post("/api/analyze-powerplant", async (req, res) => {
  try {
    const { area, city, budget } = req.body;
    
    if (!area || !city || !budget) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    const aiPrompt = \`
You are an expert Solar Power Plant Consultant in Iran. 
A user wants to establish a solar power plant to sell electricity to the national grid (Tavanir / Ministry of Energy).
Here are their inputs:
- Land Area: \${area} square meters
- Location: \${city}
- Budget: \${budget} million Tomans

Please provide a highly detailed, professional, and practical roadmap in Persian (Markdown format) that covers:
1. **Estimated Capacity**: How many kW/MW can they install with this land area and budget?
2. **Number of Panels**: Approximate number of solar panels and inverters needed.
3. **Required Equipment**: What specific equipment is needed?
4. **Legal & Licensing Steps**: Step-by-step guide to get permits from SATBA and the electricity distribution company to sell electricity.
5. **Standard Requirements**: Location setup, fencing, safety standards, grid connection requirements.
6. **Workforce**: What specialized teams/personnel are needed for installation and maintenance.
7. **Financial Analysis (Estimate)**: Return on investment (ROI), expected monthly income based on current SATBA purchase rates in Iran.

Make the response structured with Markdown headers, bullet points, and bold text for readability. Give realistic estimates for Iran.
    \`;`;

const newRoute = `app.post("/api/analyze-powerplant", async (req, res) => {
  try {
    const { area, city, budget, budgetUnit, connectionType, roofType, phase } = req.body;
    
    if (!area || !city || !budget) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    const budgetMultiplier = budgetUnit === 'billion' ? 1000 : 1;
    const totalBudgetMillion = parseFloat(budget) * budgetMultiplier;

    const aiPrompt = \`
You are an expert Solar Power Plant Consultant in Iran. 
A user wants to establish a solar power plant.
Here are their inputs:
- Land/Roof Area: \${area} square meters
- Location: \${city}
- Budget: \${totalBudgetMillion} million Tomans
- Connection Type: \${connectionType}
- Installation Type (Roof/Ground): \${roofType}
- Electricity Phase: \${phase}

Please provide a highly detailed, professional, and practical roadmap in Persian (Markdown format) that covers:
1. **Estimated Capacity**: How many kW/MW can they install with this land area and budget?
2. **Number of Panels**: Approximate number of solar panels and inverters needed.
3. **Required Equipment**: What specific equipment is needed?
4. **Legal & Licensing Steps**: Step-by-step guide to get permits from SATBA and the electricity distribution company.
5. **Standard Requirements**: Location setup, safety standards, grid connection requirements.
6. **Workforce**: What specialized teams/personnel are needed for installation and maintenance.
7. **Financial Analysis (Estimate)**: Return on investment (ROI), expected monthly income.

Make the response structured with Markdown headers, bullet points, and bold text for readability. Give realistic estimates for Iran.
    \`;`;

code = code.replace(targetRoute, newRoute);

// Also update the fallback logic and error handling
const targetLogic = `    let analysisText;
    
    if (!process.env.GEMINI_API_KEY) {
      // Fallback
      analysisText = \`### تحلیل احداث نیروگاه خورشیدی (نسخه نمایشی)

با توجه به مساحت **\${area} متر مربع** و بودجه **\${budget} میلیون تومان** در شهر **\${city}**، برآورد اولیه به شرح زیر است:

#### 1. ظرفیت تخمینی و تجهیزات
* **ظرفیت قابل احداث:** با این بودجه، حدوداً قادر به احداث یک نیروگاه 50 کیلوواتی خواهید بود (برای مساحت بیشتر نیاز به سرمایه‌گذاری بیشتر است).
* **تعداد پنل‌ها:** حدود 90 تا 100 پنل 550 واتی.
* **تجهیزات اصلی:** پنل‌های خورشیدی مونوکریستال، اینورترهای متصل به شبکه (On-Grid)، استراکچر گالوانیزه گرم، کابل‌های DC و AC، تابلو برق و سیستم ارتینگ.

#### 2. مراحل قانونی و اخذ مجوز (خرید تضمینی برق)
1. ثبت نام در سامانه مهرسان (ساتبا) یا مراجعه به شرکت توزیع نیروی برق استان.
2. ارائه مدارک مالکیت زمین و مدارک هویتی.
3. دریافت تاییدیه اتصال به شبکه از اداره برق منطقه.
4. عقد قرارداد خرید تضمینی 20 ساله با ساتبا.

#### 3. الزامات استاندارد و احداث
* زمین باید بدون سایه‌اندازی (موانع طبیعی یا مصنوعی) باشد.
* رعایت حریم شبکه‌های انتقال برق و مسیرهای دسترسی.
* فنس‌کشی و ایمن‌سازی محوطه.

#### 4. نیروی انسانی متخصص
* **تیم طراحی و مهندسی:** برای شبیه‌سازی دقیق و طراحی نقشه‌های الکتریکال.
* **تیم نصب (نصابان مجاز):** جهت نصب استراکچر و پنل‌ها با رعایت زاویه تابش.
* **ناظر نظام مهندسی:** برای تایید ایمنی و اتصال به شبکه.

#### 5. تحلیل مالی (تخمینی)
* **نرخ خرید تضمینی:** بر اساس آخرین مصوبات وزارت نیرو.
* **بازگشت سرمایه (ROI):** معمولاً بین 3 تا 4 سال.
* **درآمد ماهانه:** متناسب با تولید و فصول سال (در تابستان بیشتر).

> **توجه:** این یک خروجی شبیه‌سازی شده است. برای دریافت تحلیل دقیق مبتنی بر هوش مصنوعی، لطفاً کلید API جمینای را تنظیم کنید.
\`;
    } else {
      
      const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
      const response = await ai.models.generateContent({
        model: "gemini-2.5-pro",
        contents: aiPrompt,
      });
      analysisText = response.text;
    }`;

const newLogic = `    let analysisText = '';
    
    const fallbackText = \`### تحلیل احداث نیروگاه خورشیدی (نسخه نمایشی)

با توجه به مساحت **\${area} متر مربع** و بودجه **\${totalBudgetMillion} میلیون تومان** در شهر **\${city}**، برآورد اولیه به شرح زیر است:

#### 1. ظرفیت تخمینی و تجهیزات
* **ظرفیت قابل احداث:** با این بودجه، حدوداً قادر به احداث نیروگاه خواهید بود.
* **تجهیزات اصلی:** پنل‌های خورشیدی مونوکریستال، اینورترها، استراکچر، کابل‌های DC و AC، تابلو برق.

#### 2. مراحل قانونی و اخذ مجوز
1. ثبت نام در سامانه مهرسان (ساتبا).
2. ارائه مدارک مالکیت زمین و هویتی.
3. عقد قرارداد.

#### 3. الزامات استاندارد و احداث
* زمین بدون سایه‌اندازی.
* ایمن‌سازی محوطه.

#### 4. تحلیل مالی (تخمینی)
* **بازگشت سرمایه (ROI):** معمولاً بین 3 تا 4 سال.

> **توجه:** سیستم نتوانست تحلیل دقیق هوش مصنوعی را تولید کند (خطای API یا عدم تنظیم کلید). اطلاعات فوق به صورت پیش‌فرض نمایش داده شده‌اند.
\`;

    if (!process.env.GEMINI_API_KEY) {
      analysisText = fallbackText;
    } else {
      try {
        const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
        const response = await ai.models.generateContent({
          model: "gemini-1.5-flash",
          contents: aiPrompt,
        });
        analysisText = response.text;
      } catch (aiError) {
        console.error("AI Generation failed:", aiError);
        analysisText = fallbackText;
      }
    }`;

code = code.replace(targetLogic, newLogic);
code = code.replace("const numBudget = parseFloat(budget) || 0;", "const numBudget = totalBudgetMillion || 0;");

fs.writeFileSync('server.ts', code);
