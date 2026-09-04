import express from "express";
import { db } from "../db/index.js";
import { verifyAuthToken, requireAuth } from "./auth.js";

const subscriptionRouter = express.Router();
const APP_BASE_URL = process.env.APP_BASE_URL || "http://localhost:3000";

subscriptionRouter.get("/plans", (req, res) => {
  res.json({ plans: db.getSubscriptionPlans() });
});

subscriptionRouter.post("/purchase", verifyAuthToken, requireAuth, async (req, res) => {
  const { planId } = req.body;
  const user = req.user!;

  const plan = db.getSubscriptionPlanById(planId);
  if (!plan) return res.status(404).json({ error: "Plan not found" });

  if (plan.priceIRR === 0) {
     // Handle free plan activation immediately
     const newSub = db.createSubscription({
        userId: user.id,
        planId: plan.id,
        startDate: new Date().toISOString(),
        endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString() // default 30 days for free if not specified
     });
     db.updateUser(user.id, { activeSubscriptionId: newSub.id });
     return res.json({ message: "Free plan activated successfully", subscription: newSub });
  }

  const tx = db.createTransaction({
    userId: user.id,
    planId: plan.id,
    amount: plan.priceIRR,
  });

  try {
    // Mock Zarinpal request for now, since we don't have the real API key and we need this to run
    // const zpResponse = await fetch('https://api.zarinpal.com/pg/v4/payment/request.json', { ... });
    const mockAuthority = "A" + Math.random().toString(36).substring(2, 12).toUpperCase();
    
    db.updateTransactionAuthority(tx.id, mockAuthority);

    // In a real app we'd redirect to zarinpal:
    // const paymentUrl = `https://www.zarinpal.com/pg/StartPay/${mockAuthority}`;
    const paymentUrl = `/api/subscription/verify?Authority=${mockAuthority}&Status=OK`; // Mock redirect for testing

    res.json({ paymentUrl });
  } catch (error) {
    db.updateTransactionStatus(tx.id, "failed");
    res.status(500).json({ error: "Payment request failed" });
  }
});

subscriptionRouter.get("/verify", async (req, res) => {
  const { Authority, Status } = req.query;

  if (!Authority || typeof Authority !== "string") {
    return res.redirect("/user-dashboard?error=invalid_request");
  }

  const tx = db.getTransactionByAuthority(Authority);
  if (!tx) {
    return res.redirect("/user-dashboard?error=transaction_not_found");
  }

  if (Status !== "OK") {
    db.updateTransactionStatus(tx.id, "failed");
    return res.redirect("/user-dashboard?error=payment_failed");
  }

  // Verify with Zarinpal (mocked here)
  try {
    // In a real app:
    // const verifyRes = await fetch('https://api.zarinpal.com/pg/v4/payment/verify.json', { ... })
    const isSuccess = true;

    if (isSuccess) {
      db.updateTransactionStatus(tx.id, "success");
      const plan = db.getSubscriptionPlanById(tx.planId);
      
      const startDate = new Date();
      const endDate = new Date(startDate.getTime() + (plan?.durationDays || 30) * 24 * 60 * 60 * 1000);

      const newSub = db.createSubscription({
        userId: tx.userId,
        planId: tx.planId,
        startDate: startDate.toISOString(),
        endDate: endDate.toISOString(),
      });

      db.updateUser(tx.userId, { activeSubscriptionId: newSub.id });
      return res.redirect("/user-dashboard?success=payment_successful");
    } else {
      db.updateTransactionStatus(tx.id, "failed");
      return res.redirect("/user-dashboard?error=verification_failed");
    }
  } catch (error) {
    return res.redirect("/user-dashboard?error=server_error");
  }
});

subscriptionRouter.get("/status", verifyAuthToken, requireAuth, (req, res) => {
  const user = req.user!;
  
  if (!user.activeSubscriptionId) {
    return res.json({ active: false });
  }

  const sub = db.getSubscriptionById(user.activeSubscriptionId);
  if (!sub) {
    return res.json({ active: false });
  }

  const isExpired = new Date(sub.endDate) < new Date();
  if (isExpired) {
    db.updateUser(user.id, { activeSubscriptionId: null });
    return res.json({ active: false, expired: true });
  }

  res.json({ active: true, subscription: sub });
});

export default subscriptionRouter;
