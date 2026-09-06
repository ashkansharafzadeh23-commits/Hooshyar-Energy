import express from "express";
import cors from "cors";
import path from "path";
import { createServer as createViteServer } from "vite";
import { db } from "./src/db/index.js";
import cookieParser from "cookie-parser";
import authRouter, { verifyAuthToken } from "./src/api/auth.js";
import professionalsRouter from "./src/api/professionals.js";
import adsRouter from "./src/api/ads.js";
import userRouter from "./src/api/user.js";
import subscriptionRouter from "./src/api/subscription.js";
import assetsRouter from "./src/api/assets.js";

// Vercel handlers
import analyzeHandler from "./api/analyze.js";
import followupHandler from "./api/followup.js";
import vendorRegisterHandler from "./api/vendor/register.js";
import vendorProductsHandler from "./api/vendor/products.js";
import vendorIdHandler from "./api/vendors/[id].js";
import recommendHandler from "./api/energy/recommend.js";
import analyzeImagesHandler from "./api/energy/analyze-images.js";
import optimizeLayoutHandler from "./api/energy/optimize-layout.js";

const app = express();
const PORT = 3000;

app.use(cors());
app.use(express.json({ limit: "50mb" }));
app.use(cookieParser());

app.use("/api/auth", authRouter);
app.use("/api/professionals", professionalsRouter);
app.use("/api/ads", adsRouter);
app.use("/api/user", userRouter);
app.use("/api/subscription", subscriptionRouter);
app.use("/api/assets", assetsRouter);

app.get("/api/health", (req, res) => {
  res.json({ status: "ok" });
});

app.get("/api/vendors", (req, res) => {
  res.json(db.getVendors());
});

app.get("/api/products", (req, res) => {
  res.json(db.getProducts());
});

// Bridge for Vercel Serverless Functions
const runVercelHandler = (handler) => async (req, res) => {
  try {
    req.query = { ...req.query, ...req.params };
    await handler(req, res);
  } catch (error) {
    console.error("Vercel Handler Error:", error);
    if (!res.headersSent) {
      res.status(500).json({ error: "Internal Server Error" });
    }
  }
};

app.post("/api/analyze/followup", verifyAuthToken, async (req, res) => {
  const user = req.user;
  // For simplicity, we just pass to handler, but we could save history here too.
  const originalJson = res.json.bind(res);
  res.json = function (body) {
    if (user && res.statusCode === 200 && body.updatedResult) {
      db.addHistory({
        userId: user.id,
        input: body.updatedInput,
        resultSummary: "پیگیری: " + body.reply,
        fullResult: body.updatedResult,
      });
    }
    return originalJson(body);
  };
  await runVercelHandler(followupHandler)(req, res);
});

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
app.post("/api/energy/recommend", runVercelHandler(recommendHandler));
app.post("/api/energy/analyze-images", runVercelHandler(analyzeImagesHandler));
app.post("/api/energy/optimize-layout", runVercelHandler(optimizeLayoutHandler));

app.post("/api/plan-powerplant", async (req, res) => {
  try {
    const { area, city, roofType, phase, usage, budget } = req.body;
    let capacityKw = 0;
    if (area > 0) {
       capacityKw = (area * 0.75) / 6.5; 
    }
    const totalBudgetMillion = budget || (capacityKw * 30);
    const analysisText = `### 🗺️ نقشه راه جامع و گام‌به‌گام احداث نیروگاه خورشیدی\nبرنامه عملیاتی شما...`;
    
    const financialData = [];
    res.json({ analysis: analysisText, financialData });
  } catch (error) {
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
