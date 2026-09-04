import express from "express";
import { db } from "../db/index.js";
import { verifyAuthToken, requireAuth } from "./auth.js";

const userRouter = express.Router();

userRouter.use(verifyAuthToken);
userRouter.use(requireAuth);

userRouter.get("/history", (req, res) => {
  const userId = req.user!.id;
  const page = parseInt(req.query.page as string) || 1;
  const limit = parseInt(req.query.limit as string) || 10;
  
  const history = db.getHistoryByUserId(userId);
  
  const startIndex = (page - 1) * limit;
  const endIndex = page * limit;
  const paginatedHistory = history.slice(startIndex, endIndex);

  res.json({
    total: history.length,
    page,
    limit,
    history: paginatedHistory,
  });
});

export default userRouter;
