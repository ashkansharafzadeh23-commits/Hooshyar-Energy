import express from "express";
import cors from "cors";
import path from "path";
import { createServer as createViteServer } from "vite";
import { db } from "./src/db/index.js";
import { 
  calculateDailyConsumption, 
  calculateSolarSizing, 
  calculateGeneratorSizing, 
  calculatePowerbankSizing,
  selectPanelOptions
} from "./src/api/engine.js";
import { GoogleGenAI } from "@google/genai";

const app = express();
const PORT = 3000;

app.use(cors());
app.use(express.json());

app.get("/api/health", (req, res) => {
  res.json({ status: "ok" });
});

app.get("/api/vendors", (req, res) => {
  res.json(db.getVendors());
});

app.get("/api/vendors/:id", (req, res) => {
  const vendor = db.getVendorById(req.params.id);
  if (!vendor) return res.status(404).json({ error: "Not found" });
  res.json(vendor);
});

app.post("/api/analyze", async (req, res) => {
  try {
    const { targets, locationType, appliances, actualMonthlyKwh, area, sunHours = 5.5, supportHours = 2, essentialAppliances = [] } = req.body;
    
    let engineResults: any = {};
    const dailyKwh = calculateDailyConsumption(appliances, locationType, actualMonthlyKwh);
    engineResults.dailyConsumptionEstimate = {
      dailyKwh,
      monthlyKwh: dailyKwh * 30
    };

    if (targets.includes("solar")) {
      engineResults.solar = calculateSolarSizing(dailyKwh, area * 0.7, sunHours);
    }
    if (targets.includes("generator")) {
      engineResults.generator = calculateGeneratorSizing(appliances, locationType === "factory" || locationType === "industrial_warehouse");
    }
    if (targets.includes("powerbank")) {
      engineResults.powerbank = calculatePowerbankSizing(essentialAppliances.length > 0 ? essentialAppliances : appliances, supportHours);
    }

    const allProducts = db.getProducts();
    const vendors = db.getVendors();
    const enrichedCatalog = allProducts.map(p => {
      const vendor = vendors.find(v => v.id === p.vendorId);
      return { ...p, vendorName: vendor?.companyName, vendorCity: vendor?.city };
    });

    if (targets.includes("solar") && engineResults.solar) {
       const solarPanels = enrichedCatalog.filter(p => p.category === 'solar_panel');
       engineResults.solar.panelOptions = selectPanelOptions({
           targetSystemKwp: engineResults.solar.requiredKwp,
           usableAreaM2: area * 0.7,
           catalogPanels: solarPanels
       });
    }

    const aiPrompt = `You are the AI Layer for the Smart Energy Advisor. The deterministic Rule Engine has already calculated the technical requirements:
${JSON.stringify(engineResults, null, 2)}
Here is the catalog of available products:
${JSON.stringify(enrichedCatalog, null, 2)}
Your task is to match the Rule Engine requirements to the closest products in the catalog.
Respond STRICTLY with a JSON object in this format:
{
  "summary": "Detailed explanation of the analysis, explicitly including the recommendations for fuel types, panel counts, etc. (in Persian).",
  "technicalSpecs": [{ "label": "string", "value": "string", "description": "string" }],
  "dailyConsumptionEstimate": { "dailyKwh": number, "monthlyKwh": number },
  "recommendedProducts": [
    {
      "id": "product_id from catalog",
      "category": "string",
      "brand": "string",
      "model": "string",
      "specs": {},
      "price": number,
      "currency": "IRR",
      "vendorName": "exact vendorName from catalog",
      "vendorCity": "exact vendorCity from catalog",
      "reason": "Why this product was chosen"
    }
  ],
  "requiredAccessories": [{ "name": "string (in Persian)", "availableInCatalog": boolean }],
  "estimatedTotalCost": number,
  "warnings": [{ "severity": "error"|"warning"|"info", "message": "string (in Persian)" }],
  "energySavingTips": [{ "title": "string (in Persian)", "description": "string (in Persian)" }]
}`;

    let aiResult;
    if (process.env.GEMINI_API_KEY) {
      try {
        const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
        const response = await ai.models.generateContent({
          model: "gemini-1.5-flash",
          contents: aiPrompt,
          config: {
             responseMimeType: "application/json"
          }
        });
        aiResult = JSON.parse(response.text || "{}");
      } catch (err) {
        console.error("AI error:", err);
      }
    }
    
    if (!aiResult || !aiResult.recommendedProducts) {
      aiResult = {
        summary: "تحلیل پایه بر اساس موتور قوانین انجام شد. برای دریافت پیشنهادات هوشمندتر کلید API جمینای را تنظیم کنید.",
        technicalSpecs: [
          ...(engineResults.solar ? [
            { label: "ظرفیت پنل خورشیدی", value: `${engineResults.solar.requiredKwp} kWp` },
            { label: "فضای مورد نیاز", value: `${engineResults.solar.estimatedAreaNeededM2} متر مربع` }
          ] : []),
          ...(engineResults.generator ? [
            { label: "ظرفیت موتور برق", value: `${engineResults.generator.requiredKva} kVA` }
          ] : [])
        ],
        dailyConsumptionEstimate: engineResults.dailyConsumptionEstimate,
        recommendedProducts: engineResults.solar?.panelOptions?.options?.map((opt) => ({
          id: opt.productId,
          category: "solar_panel",
          brand: opt.brand,
          model: opt.model,
          price: opt.totalCost,
          vendorName: "انرژی نوین",
          vendorCity: "تهران",
          reason: opt.label + ` (${opt.panelCount} عدد)`
        })) || enrichedCatalog.slice(0, 2).map((p) => ({
          id: p.id,
          category: p.category,
          brand: p.brand,
          model: p.model,
          price: p.price,
          vendorName: p.vendorName || "فروشنده نمونه",
          vendorCity: p.vendorCity || "تهران",
          reason: "تطابق با نیازمندی‌های اولیه شما (نسخه دمو)"
        })),
        requiredAccessories: [
          ...(engineResults.solar ? [
            { name: "کابل سولار MC4", availableInCatalog: true },
            { name: "سازه‌های آلومینیومی نصب", availableInCatalog: true },
            { name: "اینورتر و شارژ کنترلر", availableInCatalog: false },
            { name: "باتری خورشیدی", availableInCatalog: true }
          ] : []),
          ...(engineResults.generator ? [
            { name: "کابل برق استاندارد", availableInCatalog: true },
            { name: "تابلو برق چنج‌اور (ATS)", availableInCatalog: false }
          ] : []),
          ...(engineResults.powerbank ? [
             { name: "پنل تاشو جهت شارژ مجدد (اختیاری)", availableInCatalog: true }
          ] : [])
        ],
        estimatedTotalCost: enrichedCatalog.slice(0, 2).reduce((sum, p) => sum + p.price, 0),
        warnings: [
          { severity: "warning", message: "این یک خروجی شبیه‌سازی شده است (به دلیل عدم دسترسی به کلید API هوش مصنوعی)." }
        ]
      };
    }
    res.json(aiResult);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Analysis failed" });
  }
});


app.post("/api/analyze-maintenance", express.json({limit: '50mb'}), async (req, res) => {
  try {
    const { images, textContext } = req.body;
    
    if (!images || !Array.isArray(images) || images.length === 0) {
      return res.status(400).json({ error: "Missing images" });
    }

    const aiPrompt = `شما یک کارشناس خبره تعمیر و نگهداری تجهیزات خورشیدی و ژنراتور هستید. کاربر تصاویری از تجهیزات خود ارسال کرده است. اطلاعات تکمیلی کاربر: "${textContext || 'ندارد'}".
لطفا تصاویر را تحلیل کنید و موارد زیر را ارائه دهید:
1. وضعیت ظاهری و سلامت تجهیزات
2. مشکلات احتمالی یا خرابی‌های قابل مشاهده
3. توصیه‌های تعمیر و نگهداری
پاسخ خود را به زبان فارسی و با فرمت Markdown و ساختاریافته بنویسید.`;

    let analysisText = `### تحلیل هوشمند تصاویر (نسخه نمایشی)
> **توجه:** سیستم نتوانست تحلیل دقیق هوش مصنوعی را تولید کند (خطای API یا عدم تنظیم کلید).

#### 1. وضعیت ظاهری تجهیزات
با توجه به تصاویر ارسالی، به نظر می‌رسد تجهیزات نیاز به بررسی دقیق‌تر فیزیکی دارند. گرد و غبار روی پنل‌ها یا قطعات مکانیکی قابل مشاهده است که می‌تواند راندمان را کاهش دهد.

#### 2. مشکلات احتمالی
احتمال اتصالات شل یا فرسودگی کابل‌ها وجود دارد. لطفاً سیم‌کشی‌ها را بررسی کنید.

#### 3. توصیه‌های نگهداری
- شستشوی دوره‌ای پنل‌ها.
- بررسی اتصالات و کابل‌ها توسط تکنسین مجاز.
- مراجعه به یکی از تعمیرکاران مجاز سایت.`;

    if (process.env.GEMINI_API_KEY) {
      try {
        const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
        
        const contents = [
          aiPrompt,
          ...images.map(img => ({
            inlineData: {
              data: img.data, // base64 string without data:image/jpeg;base64,
              mimeType: img.mimeType // e.g., image/jpeg
            }
          }))
        ];

        const response = await ai.models.generateContent({
          model: "gemini-2.5-flash",
          contents: contents,
        });
        analysisText = response.text;
      } catch (aiError) {
        console.error("AI Generation failed:", aiError);
      }
    }
    
    res.json({ analysis: analysisText });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Analysis failed" });
  }
});

app.post("/api/analyze-powerplant", async (req, res) => {
  try {
    const { area, city, budget, budgetUnit, connectionType, roofType, phase } = req.body;
    
    if (!area || !city || !budget) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    const budgetMultiplier = budgetUnit === 'billion' ? 1000 : 1;
    const totalBudgetMillion = parseFloat(budget) * budgetMultiplier;

    const numArea = parseFloat(area) || 0;
    const numBudget = totalBudgetMillion || 0;
    
    const possibleCapacityByBudget = numBudget / 30;
    const possibleCapacityByArea = numArea / 10;
    const capacityKw = Math.max(0, Math.min(possibleCapacityByBudget, possibleCapacityByArea));

    const aiPrompt = `You are a Senior Solar Power Plant Consultant in Iran. 
A user wants to establish a solar power plant.
Here are their inputs:
- Land/Roof Area: ${area} square meters
- Location: ${city}
- Budget: ${totalBudgetMillion} million Tomans
- Connection Type: ${connectionType}
- Installation Type (Roof/Ground): ${roofType}
- Electricity Phase: ${phase}

Please provide a highly detailed, professional, and practical step-by-step roadmap in Persian (Markdown format). It must guide the user strictly on what to do first, second, etc. Include these sections:
1. **برآورد فنی و ظرفیت (Technical & Capacity Estimate)**: How many kW/MW can they install with this land area and budget? How many panels and inverters?
2. **گام اول: امکان‌سنجی و بررسی‌های اولیه (Step 1: Feasibility Study)**: What to check (shading, structural integrity of roof, grid proximity).
3. **گام دوم: مراحل اداری و اخذ مجوزها (ساتبا) (Step 2: Legal & Permits)**: Step-by-step SATBA registration, getting grid connection permit, signing the PPA (Power Purchase Agreement).
4. **گام سوم: انتخاب پیمانکار (EPC) و تامین تجهیزات (Step 3: Choosing EPC & Equipment)**: How to choose a contractor, what equipment specs to look for.
5. **گام چهارم: احداث و اتصال به شبکه (Step 4: Installation & Grid Connection)**: Installation steps, testing, and getting the meter installed by the utility company.
6. **برنامه تعمیر و نگهداری (Maintenance Plan)**: Cleaning panels, checking inverters, standard periodic checks.
7. **تحلیل مالی و بازگشت سرمایه (Financial Analysis)**: Expected ROI, payback period, and monthly revenue.

Use bold text, bullet points, and clear headers to make it highly readable and professional. Provide realistic numbers for Iran.`;

    let analysisText = `### 🗺️ نقشه راه جامع و گام‌به‌گام احداث نیروگاه خورشیدی

با توجه به اطلاعات وارد شده (مساحت **${area} متر مربع** و بودجه **${totalBudgetMillion} میلیون تومان** در شهر **${city}**)، برنامه عملیاتی شما به شرح زیر است:

#### 📊 ۱. برآورد فنی و ظرفیت احداث
* **ظرفیت تخمینی:** حدود ${capacityKw > 0 ? Math.floor(capacityKw) : 'نامشخص'} کیلووات (kWp).
* **تجهیزات اصلی مورد نیاز:** 
  * حدود ${capacityKw > 0 ? Math.floor((capacityKw * 1000) / 550) : 0} عدد پنل خورشیدی (مثلاً 550 واتی).
  * اینورتر متصل به شبکه (On-Grid) متناسب با ظرفیت.
  * سازه‌های نصب (استراکچر) گالوانیزه گرم.
  * کابل‌های DC، تابلو برق حفاظتی و کنتور دوطرفه.

---

#### 🛠️ گام اول: امکان‌سنجی و بررسی‌های اولیه
پیش از هر اقدام اداری، باید شرایط فیزیکی محل احداث را بررسی کنید:
1. **بررسی سایه‌اندازی:** اطمینان حاصل کنید که در طول روز هیچ سایه‌ای از ساختمان‌ها، درختان یا دکل‌های مجاور روی محل نصب نمی‌افتد.
2. **استحکام سقف/زمین:** اگر نصب روی سقف (${roofType === 'flat' ? 'مسطح' : 'شیب‌دار'}) است، سقف باید تحمل بار اضافه (حدود ۱۵ الی ۲۰ کیلوگرم بر متر مربع) را داشته باشد.
3. **بررسی انشعاب برق موجود:** فاز شبکه شما **${phase === '3-phase' ? 'سه فاز' : 'تک فاز'}** است. ظرفیت نیروگاه شما نمی‌تواند از ظرفیت انشعاب خریداری شده فعلی تجاوز کند (مگر با درخواست افزایش انشعاب).

---

#### 📝 گام دوم: مراحل اداری و اخذ مجوزها (تضمین خرید برق)
برای فروش برق به دولت، باید مراحل زیر را طی کنید:
1. **ثبت‌نام در سامانه مهرسان (ساتبا):** ایجاد حساب کاربری و ثبت درخواست احداث نیروگاه تجدیدپذیر.
2. **بازدید شرکت توزیع نیروی برق:** پس از ثبت درخواست، کارشناسان شرکت توزیع برق منطقه‌ای (${city}) برای بررسی اتصال به شبکه بازدید می‌کنند.
3. **دریافت تاییدیه اتصال به شبکه:** در صورت بلامانع بودن، مجوز احداث صادر می‌شود.
4. **عقد قرارداد خرید تضمینی:** امضای قرارداد ۲۰ ساله با ساتبا برای خرید تضمینی برق تولیدی.

---

#### 👷 گام سوم: انتخاب پیمانکار (EPC) و تامین تجهیزات
پس از دریافت مجوزها، زمان شروع کار اجرایی است:
* **استعلام قیمت:** از حداقل ۳ شرکت معتبر و مورد تایید شرکت توزیع برق استعلام بگیرید.
* **تجهیزات استاندارد:** حتما قید کنید که پنل‌ها دارای راندمان بالا (Tier 1) و اینورترها دارای خدمات پس از فروش در ایران باشند.
* **قرارداد EPC:** قراردادی شامل طراحی (Engineering)، تامین تجهیزات (Procurement) و اجرا (Construction) ببندید.

---

#### ⚡ گام چهارم: نصب، تست و بهره‌برداری
1. **نصب سازه و پنل‌ها:** اجرای استراکچرها با زاویه و جهت مناسب رو به جنوب.
2. **کابل‌کشی و نصب اینورتر:** اجرای کابل‌کشی‌های DC و AC و نصب تابلو برق‌های حفاظتی.
3. **تست و تایید شرکت توزیع:** بازدید نهایی توسط کارشناسان شرکت توزیع و نصب **کنتور دوطرفه**.
4. **شروع درآمدزایی:** با تزریق برق به شبکه، درآمد شما محاسبه شده و هر دو ماه یکبار به حساب شما واریز می‌شود.

---

#### 🔧 برنامه تعمیر و نگهداری دوره‌ای (O&M)
برای حفظ راندمان بالا، اقدامات زیر ضروری است:
* **شستشوی پنل‌ها:** بسته به میزان گرد و غبار شهر ${city}، هر ۱ تا ۳ ماه یکبار پنل‌ها باید شسته شوند.
* **بازدید دوره‌ای:** چک کردن اتصالات، کابل‌ها و عملکرد اینورتر هر ۶ ماه یکبار توسط تکنسین.

> **💡 نکته:** سیستم نتوانست تحلیل متنی اختصاصی هوش مصنوعی را تولید کند (خطای API). مقادیر و مراحل فوق به صورت هوشمند و بر اساس قوانین کلی احداث شبیه‌سازی شده‌اند.`;

    if (process.env.GEMINI_API_KEY) {
      try {
        const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
        const response = await ai.models.generateContent({
          model: "gemini-1.5-flash",
          contents: aiPrompt,
        });
        analysisText = response.text;
      } catch (aiError) {
        console.error("AI Generation failed:", aiError);
      }
    }


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
        year: `سال ${year}`,
        revenue: Math.round(revenue),
        maintenance: Math.round(maintenanceCost),
        netProfit: Math.round(netProfit),
        cumulativeProfit: Math.round(cumulativeProfit)
      });
    }

    res.json({ analysis: analysisText, financialData });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Analysis failed" });
  }
});

async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }
  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on port ${PORT}`);
  });
}

startServer();
