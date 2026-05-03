import { Router, IRouter } from "express";
import { db, meetingsTable, usersTable, messagesTable } from "@workspace/db";
import { eq, desc, and, or, sql } from "drizzle-orm";
import { requireAuth, optionalAuth } from "../middlewares/auth";
import { generateRoomId, hashPassword, comparePassword } from "../lib/auth";

const router: IRouter = Router();

function formatMeeting(meeting: typeof meetingsTable.$inferSelect, hostName: string) {
  return {
    id: meeting.id,
    roomId: meeting.roomId,
    title: meeting.title,
    hostId: meeting.hostId,
    hostName,
    status: meeting.status,
    isLocked: meeting.isLocked,
    settings: meeting.settings,
    participantCount: meeting.participantCount,
    duration: meeting.durationSeconds,
    startedAt: meeting.startedAt?.toISOString() ?? null,
    endedAt: meeting.endedAt?.toISOString() ?? null,
    createdAt: meeting.createdAt.toISOString(),
  };
}

router.post("/v1/meetings", requireAuth, async (req, res): Promise<void> => {
  const { title, settings, passcode } = req.body;
  const [host] = await db.select().from(usersTable).where(eq(usersTable.id, req.user!.userId));
  const roomId = generateRoomId();
  const meetingTitle = title || `${host.name}'s Meeting`;
  let passcodeHash: string | undefined;
  if (passcode) {
    passcodeHash = await hashPassword(passcode);
  }
  const meetingSettings = {
    waitingRoomEnabled: settings?.waitingRoomEnabled ?? true,
    allowParticipantScreenShare: settings?.allowParticipantScreenShare ?? true,
    allowParticipantChat: settings?.allowParticipantChat ?? true,
    muteOnEntry: settings?.muteOnEntry ?? false,
    autoRecord: settings?.autoRecord ?? false,
    passcodeRequired: !!passcode,
  };
  const [meeting] = await db.insert(meetingsTable).values({
    roomId,
    title: meetingTitle,
    hostId: req.user!.userId,
    passcodeHash,
    status: "active",
    settings: meetingSettings,
    startedAt: new Date(),
  }).returning();
  res.status(201).json(formatMeeting(meeting, host.name));
});

router.get("/v1/meetings/history", requireAuth, async (req, res): Promise<void> => {
  const page = parseInt(String(req.query.page ?? "1"), 10);
  const limit = parseInt(String(req.query.limit ?? "10"), 10);
  const offset = (page - 1) * limit;
  const status = req.query.status as string | undefined;
  const conditions = [eq(meetingsTable.hostId, req.user!.userId)];
  if (status) conditions.push(eq(meetingsTable.status, status));
  const meetings = await db.select().from(meetingsTable).where(and(...conditions)).orderBy(desc(meetingsTable.createdAt)).limit(limit).offset(offset);
  const [{ count }] = await db.select({ count: sql<number>`count(*)::int` }).from(meetingsTable).where(and(...conditions));
  const host = await db.select().from(usersTable).where(eq(usersTable.id, req.user!.userId));
  const hostName = host[0]?.name ?? "Unknown";
  res.json({ meetings: meetings.map(m => formatMeeting(m, hostName)), total: count, page, limit });
});

router.get("/v1/meetings/:roomId", optionalAuth, async (req, res): Promise<void> => {
  const rawId = Array.isArray(req.params.roomId) ? req.params.roomId[0] : req.params.roomId;
  const [meeting] = await db.select().from(meetingsTable).where(eq(meetingsTable.roomId, rawId));
  if (!meeting) {
    res.status(404).json({ error: "Meeting not found" });
    return;
  }
  const [host] = await db.select().from(usersTable).where(eq(usersTable.id, meeting.hostId));
  res.json(formatMeeting(meeting, host?.name ?? "Unknown"));
});

router.patch("/v1/meetings/:roomId", requireAuth, async (req, res): Promise<void> => {
  const rawId = Array.isArray(req.params.roomId) ? req.params.roomId[0] : req.params.roomId;
  const { title, status, isLocked, settings } = req.body;
  const updates: Record<string, unknown> = {};
  if (title != null) updates.title = title;
  if (status != null) {
    updates.status = status;
    if (status === "ended") updates.endedAt = new Date();
  }
  if (isLocked != null) updates.isLocked = isLocked;
  if (settings != null) updates.settings = settings;
  const [meeting] = await db.update(meetingsTable).set(updates).where(eq(meetingsTable.roomId, rawId)).returning();
  if (!meeting) {
    res.status(404).json({ error: "Meeting not found" });
    return;
  }
  const [host] = await db.select().from(usersTable).where(eq(usersTable.id, meeting.hostId));
  res.json(formatMeeting(meeting, host?.name ?? "Unknown"));
});

router.delete("/v1/meetings/:roomId", requireAuth, async (req, res): Promise<void> => {
  const rawId = Array.isArray(req.params.roomId) ? req.params.roomId[0] : req.params.roomId;
  await db.delete(meetingsTable).where(and(eq(meetingsTable.roomId, rawId), eq(meetingsTable.hostId, req.user!.userId)));
  res.sendStatus(204);
});

router.post("/v1/meetings/:roomId/verify-passcode", async (req, res): Promise<void> => {
  const rawId = Array.isArray(req.params.roomId) ? req.params.roomId[0] : req.params.roomId;
  const { passcode } = req.body;
  const [meeting] = await db.select().from(meetingsTable).where(eq(meetingsTable.roomId, rawId));
  if (!meeting) {
    res.status(404).json({ error: "Meeting not found" });
    return;
  }
  if (!meeting.passcodeHash) {
    res.json({ success: true, message: "No passcode required" });
    return;
  }
  const valid = await comparePassword(passcode, meeting.passcodeHash);
  if (!valid) {
    res.status(401).json({ error: "Incorrect passcode" });
    return;
  }
  res.json({ success: true, message: "Passcode verified" });
});

router.get("/v1/meetings/:roomId/messages", optionalAuth, async (req, res): Promise<void> => {
  const rawId = Array.isArray(req.params.roomId) ? req.params.roomId[0] : req.params.roomId;
  const page = parseInt(String(req.query.page ?? "1"), 10);
  const limit = parseInt(String(req.query.limit ?? "50"), 10);
  const offset = (page - 1) * limit;
  const messages = await db.select().from(messagesTable).where(eq(messagesTable.roomId, rawId)).orderBy(messagesTable.timestamp).limit(limit).offset(offset);
  res.json(messages.map(m => ({
    id: m.id,
    roomId: m.roomId,
    senderId: m.senderId,
    senderName: m.senderName,
    message: m.message,
    type: m.type,
    timestamp: m.timestamp.toISOString(),
  })));
});

export default router;
