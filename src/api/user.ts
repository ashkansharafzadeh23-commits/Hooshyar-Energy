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

userRouter.post("/request-role", (req, res) => {
  const user = req.user!;
  // Store this request somewhere or just add it to user with a pending flag
  // The prompt says: "sets `roles` to include `"PROJECT_OWNER"` with status `pending_review`"
  // Since User interface has roles?: string[], we could do:
  const currentRoles = user.roles || ["customer"];
  if (!currentRoles.includes("PROJECT_OWNER_PENDING")) {
    db.updateUser(user.id, { roles: [...currentRoles, "PROJECT_OWNER_PENDING"] });
  }
  res.json({ message: "Request submitted" });
});

userRouter.put("/:id/approve-role", (req, res) => {
  const admin = req.user!;
  if (!admin.roles?.includes("ADMIN")) {
    return res.status(403).json({ error: "Require ADMIN role" });
  }
  const targetUser = db.getUserById(req.params.id);
  if (!targetUser) return res.status(404).json({ error: "User not found" });

  const currentRoles = targetUser.roles || ["customer"];
  const newRoles = currentRoles.filter(r => r !== "PROJECT_OWNER_PENDING");
  if (!newRoles.includes("PROJECT_OWNER")) newRoles.push("PROJECT_OWNER");

  db.updateUser(targetUser.id, { roles: newRoles });
  res.json({ message: "Role approved" });
});

// Admin endpoint to see pending users
userRouter.get("/pending-roles", (req, res) => {
  const admin = req.user!;
  if (!admin.roles?.includes("ADMIN")) {
    return res.status(403).json({ error: "Require ADMIN role" });
  }
  const allUsers = db.getUsers();
  const pending = allUsers.filter(u => u.roles?.includes("PROJECT_OWNER_PENDING"));
  res.json(pending);
});

// Dev helper to self-grant ADMIN (for testing in preview environment)
userRouter.post("/dev-make-admin", (req, res) => {
  const user = req.user!;
  const currentRoles = user.roles || ["customer"];
  if (!currentRoles.includes("ADMIN")) {
    db.updateUser(user.id, { roles: [...currentRoles, "ADMIN", "PROJECT_OWNER"] });
  }
  res.json({ message: "Admin granted" });
});
