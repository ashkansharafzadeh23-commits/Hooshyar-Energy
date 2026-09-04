const fs = require('fs');
let content = fs.readFileSync('server.ts', 'utf-8');

// Replace the entire /api/analyze route with a bridge to api/analyze.js
const analyzeRouteStart = 'app.post("/api/analyze"';
const analyzeRouteRegex = /app\.post\("\/api\/analyze"[\s\S]+?\}\);/g;

// Create bridge function
const bridgeCode = `
// Bridge for Vercel Serverless Functions
const runVercelHandler = (handler) => async (req, res) => {
  try {
    // Vercel handlers expect req.query to be populated, which express does
    // For dynamic routes like [id].js, we need to merge req.params into req.query
    req.query = { ...req.query, ...req.params };
    await handler(req, res);
  } catch (error) {
    console.error("Vercel Handler Error:", error);
    if (!res.headersSent) {
      res.status(500).json({ error: "Internal Server Error" });
    }
  }
};

import analyzeHandler from "./api/analyze.js";
import vendorRegisterHandler from "./api/vendor/register.js";
import vendorProductsHandler from "./api/vendor/products.js";
import vendorIdHandler from "./api/vendors/[id].js";

// We need to keep the verifyAuthToken and history tracking for analyze, 
// so we'll wrap the Vercel handler for the analyze route.
app.post("/api/analyze", verifyAuthToken, async (req, res) => {
  const user = req.user;
  if (user) {
    const isSubscribed = user.activeSubscriptionId && db.getSubscriptionById(user.activeSubscriptionId)?.endDate > new Date().toISOString();
    if (!isSubscribed) {
      const history = db.getHistoryByUserId(user.id);
      const currentMonth = new Date().getMonth();
      const currentYear = new Date().getFullYear();
      const monthlyAnalyses = history.filter(h => {
        const d = new Date(h.createdAt);
        return d.getMonth() === currentMonth && d.getFullYear() === currentYear;
      });
      if (monthlyAnalyses.length >= 3) {
        return res.status(402).json({ error: "شما از سقف تحلیل رایگان این ماه (۳ بار) عبور کرده‌اید. برای تحلیل بیشتر، اشتراک تهیه کنید." });
      }
    }
  }

  // Intercept res.json to save history
  const originalJson = res.json.bind(res);
  res.json = function (body) {
    if (user && res.statusCode === 200) {
      db.addHistory({
        userId: user.id,
        input: req.body,
        resultSummary: body.summary || "بدون خلاصه",
        fullResult: body,
      });
    }
    return originalJson(body);
  };

  await runVercelHandler(analyzeHandler)(req, res);
});

app.post("/api/vendor/register", runVercelHandler(vendorRegisterHandler));
app.post("/api/vendor/products", runVercelHandler(vendorProductsHandler));
app.get("/api/vendor/products", runVercelHandler(vendorProductsHandler));
app.get("/api/vendors/:id", runVercelHandler(vendorIdHandler));
`;

content = content.replace(analyzeRouteRegex, bridgeCode);

fs.writeFileSync('server.ts', content);
