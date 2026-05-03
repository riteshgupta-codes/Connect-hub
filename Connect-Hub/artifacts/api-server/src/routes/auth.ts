import { Router, IRouter } from "express";
import { db, usersTable } from "@workspace/db";
import { eq } from "drizzle-orm";
import { signToken, hashPassword, comparePassword } from "../lib/auth";
import { requireAuth } from "../middlewares/auth";

const router: IRouter = Router();

router.post("/v1/auth/register", async (req, res): Promise<void> => {
  const { name, email, password } = req.body;
  if (!name || !email || !password) {
    res.status(400).json({ error: "Name, email, and password are required" });
    return;
  }
  if (password.length < 8) {
    res.status(400).json({ error: "Password must be at least 8 characters" });
    return;
  }
  const [existing] = await db.select().from(usersTable).where(eq(usersTable.email, email));
  if (existing) {
    res.status(409).json({ error: "An account with this email already exists" });
    return;
  }
  const passwordHash = await hashPassword(password);
  const [user] = await db.insert(usersTable).values({ name, email, passwordHash, plan: "free" }).returning();
  const token = signToken({ userId: user.id, email: user.email });
  res.status(201).json({
    user: { id: user.id, name: user.name, email: user.email, displayName: user.displayName, avatar: user.avatar, plan: user.plan, createdAt: user.createdAt.toISOString() },
    token,
  });
});

router.post("/v1/auth/login", async (req, res): Promise<void> => {
  const { email, password } = req.body;
  if (!email || !password) {
    res.status(400).json({ error: "Email and password are required" });
    return;
  }
  const [user] = await db.select().from(usersTable).where(eq(usersTable.email, email));
  if (!user || !user.passwordHash) {
    res.status(401).json({ error: "Invalid email or password" });
    return;
  }
  const valid = await comparePassword(password, user.passwordHash);
  if (!valid) {
    res.status(401).json({ error: "Invalid email or password" });
    return;
  }
  const token = signToken({ userId: user.id, email: user.email });
  res.json({
    user: { id: user.id, name: user.name, email: user.email, displayName: user.displayName, avatar: user.avatar, plan: user.plan, createdAt: user.createdAt.toISOString() },
    token,
  });
});

router.post("/v1/auth/logout", (_req, res): void => {
  res.json({ success: true, message: "Logged out" });
});

router.get("/v1/auth/me", requireAuth, async (req, res): Promise<void> => {
  const [user] = await db.select().from(usersTable).where(eq(usersTable.id, req.user!.userId));
  if (!user) {
    res.status(401).json({ error: "User not found" });
    return;
  }
  res.json({ id: user.id, name: user.name, email: user.email, displayName: user.displayName, avatar: user.avatar, plan: user.plan, createdAt: user.createdAt.toISOString() });
});

router.patch("/v1/auth/profile", requireAuth, async (req, res): Promise<void> => {
  const { name, displayName, avatar, preferences } = req.body;
  const updates: Record<string, unknown> = {};
  if (name != null) updates.name = name;
  if (displayName != null) updates.displayName = displayName;
  if (avatar != null) updates.avatar = avatar;
  if (preferences != null) updates.preferences = preferences;
  const [user] = await db.update(usersTable).set(updates).where(eq(usersTable.id, req.user!.userId)).returning();
  res.json({ id: user.id, name: user.name, email: user.email, displayName: user.displayName, avatar: user.avatar, plan: user.plan, createdAt: user.createdAt.toISOString() });
});

router.post("/v1/auth/change-password", requireAuth, async (req, res): Promise<void> => {
  const { currentPassword, newPassword } = req.body;
  const [user] = await db.select().from(usersTable).where(eq(usersTable.id, req.user!.userId));
  if (!user?.passwordHash) {
    res.status(400).json({ error: "Cannot change password for this account" });
    return;
  }
  const valid = await comparePassword(currentPassword, user.passwordHash);
  if (!valid) {
    res.status(401).json({ error: "Current password is incorrect" });
    return;
  }
  const passwordHash = await hashPassword(newPassword);
  await db.update(usersTable).set({ passwordHash }).where(eq(usersTable.id, user.id));
  res.json({ success: true, message: "Password changed" });
});

export default router;
