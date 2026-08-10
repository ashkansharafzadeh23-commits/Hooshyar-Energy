const fs = require('fs');
let code = fs.readFileSync('server.ts', 'utf-8');

const newEndpoint = `
app.post("/api/analyze-maintenance", express.json({limit: '50mb'}), async (req, res) => {
  try {
    const { images, textContext } = req.body;
    
    if (!images || !Array.isArray(images) || images.length === 0) {
      return res.status(400).json({ error: "Missing images" });
    }

    const aiPrompt = \`شما یک کارشناس خبره تعمیر و نگهداری تجهیزات خورشیدی و ژنراتور هستید. کاربر تصاویری از تجهیزات خود ارسال کرده است. اطلاعات تکمیلی کاربر: "\${textContext || 'ندارد'}".
لطفا تصاویر را تحلیل کنید و موارد زیر را ارائه دهید:
1. وضعیت ظاهری و سلامت تجهیزات
2. مشکلات احتمالی یا خرابی‌های قابل مشاهده
3. توصیه‌های تعمیر و نگهداری
پاسخ خود را به زبان فارسی و با فرمت Markdown و ساختاریافته بنویسید.\`;

    let analysisText = \`### تحلیل هوشمند تصاویر (نسخه نمایشی)
> **توجه:** سیستم نتوانست تحلیل دقیق هوش مصنوعی را تولید کند (خطای API یا عدم تنظیم کلید).

#### 1. وضعیت ظاهری تجهیزات
با توجه به تصاویر ارسالی، به نظر می‌رسد تجهیزات نیاز به بررسی دقیق‌تر فیزیکی دارند. گرد و غبار روی پنل‌ها یا قطعات مکانیکی قابل مشاهده است که می‌تواند راندمان را کاهش دهد.

#### 2. مشکلات احتمالی
احتمال اتصالات شل یا فرسودگی کابل‌ها وجود دارد. لطفاً سیم‌کشی‌ها را بررسی کنید.

#### 3. توصیه‌های نگهداری
- شستشوی دوره‌ای پنل‌ها.
- بررسی اتصالات و کابل‌ها توسط تکنسین مجاز.
- مراجعه به یکی از تعمیرکاران مجاز سایت.\`;

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
`;

code = code.replace('app.post("/api/analyze-powerplant"', newEndpoint + '\napp.post("/api/analyze-powerplant"');

fs.writeFileSync('server.ts', code);
