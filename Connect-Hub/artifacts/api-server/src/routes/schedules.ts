import { Router, IRouter } from "express";
import { db, schedulesTable } from "@workspace/db";
import { eq, and, desc } from "drizzle-orm";
import { requireAuth } from "../middlewares/auth";

const router: IRouter = Router();

function formatSchedule(s: typeof schedulesTable.$inferSelect) {
  return {
    id: s.id,
    hostId: s.hostId,
    title: s.title,
    description: s.description ?? null,
    scheduledFor: s.scheduledFor.toISOString(),
    durationMinutes: s.durationMinutes,
    invitees: s.invitees,
    passcode: s.passcode ?? null,
    settings: s.settings,
    status: s.status,
    meetingRoomId: s.meetingRoomId ?? null,
    createdAt: s.createdAt.toISOString(),
  };
}

router.post("/v1/schedules", requireAuth, async (req, res): Promise<void> => {
  const { title, description, scheduledFor, durationMinutes, invitees, passcode, settings } = req.body;
  if (!title || !scheduledFor) {
    res.status(400).json({ error: "Title and scheduledFor are required" });
    return;
  }
  const [schedule] = await db.insert(schedulesTable).values({
    hostId: req.user!.userId,
    title,
    description: description ?? null,
    scheduledFor: new Date(scheduledFor),
    durationMinutes: durationMinutes ?? 60,
    invitees: invitees ?? [],
    passcode: passcode ?? null,
    settings: settings ?? {
      waitingRoomEnabled: true,
      allowParticipantScreenShare: true,
      allowParticipantChat: true,
      muteOnEntry: false,
      autoRecord: false,
      passcodeRequired: !!passcode,
    },
    status: "upcoming",
  }).returning();
  res.status(201).json(formatSchedule(schedule));
});

router.get("/v1/schedules", requireAuth, async (req, res): Promise<void> => {
  const status = req.query.status as string | undefined;
  const page = parseInt(String(req.query.page ?? "1"), 10);
  const limit = parseInt(String(req.query.limit ?? "10"), 10);
  const offset = (page - 1) * limit;
  const conditions = [eq(schedulesTable.hostId, req.user!.userId)];
  if (status && status !== "all") conditions.push(eq(schedulesTable.status, status));
  const schedules = await db.select().from(schedulesTable).where(and(...conditions)).orderBy(schedulesTable.scheduledFor).limit(limit).offset(offset);
  res.json(schedules.map(formatSchedule));
});

router.get("/v1/schedules/:id", requireAuth, async (req, res): Promise<void> => {
  const raw = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
  const id = parseInt(raw, 10);
  const [schedule] = await db.select().from(schedulesTable).where(and(eq(schedulesTable.id, id), eq(schedulesTable.hostId, req.user!.userId)));
  if (!schedule) {
    res.status(404).json({ error: "Schedule not found" });
    return;
  }
  res.json(formatSchedule(schedule));
});

router.patch("/v1/schedules/:id", requireAuth, async (req, res): Promise<void> => {
  const raw = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
  const id = parseInt(raw, 10);
  const { title, description, scheduledFor, durationMinutes, invitees, status } = req.body;
  const updates: Record<string, unknown> = {};
  if (title != null) updates.title = title;
  if (description != null) updates.description = description;
  if (scheduledFor != null) updates.scheduledFor = new Date(scheduledFor);
  if (durationMinutes != null) updates.durationMinutes = durationMinutes;
  if (invitees != null) updates.invitees = invitees;
  if (status != null) updates.status = status;
  const [schedule] = await db.update(schedulesTable).set(updates).where(and(eq(schedulesTable.id, id), eq(schedulesTable.hostId, req.user!.userId))).returning();
  if (!schedule) {
    res.status(404).json({ error: "Schedule not found" });
    return;
  }
  res.json(formatSchedule(schedule));
});

router.delete("/v1/schedules/:id", requireAuth, async (req, res): Promise<void> => {
  const raw = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
  const id = parseInt(raw, 10);
  await db.delete(schedulesTable).where(and(eq(schedulesTable.id, id), eq(schedulesTable.hostId, req.user!.userId)));
  res.sendStatus(204);
});

export default router;
