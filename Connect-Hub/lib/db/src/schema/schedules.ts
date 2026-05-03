import { pgTable, text, serial, timestamp, jsonb, integer } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const schedulesTable = pgTable("schedules", {
  id: serial("id").primaryKey(),
  hostId: integer("host_id").notNull(),
  title: text("title").notNull(),
  description: text("description"),
  scheduledFor: timestamp("scheduled_for", { withTimezone: true }).notNull(),
  durationMinutes: integer("duration_minutes").notNull().default(60),
  invitees: text("invitees").array().notNull().default([]),
  passcode: text("passcode"),
  settings: jsonb("settings").$type<{
    waitingRoomEnabled: boolean;
    allowParticipantScreenShare: boolean;
    allowParticipantChat: boolean;
    muteOnEntry: boolean;
    autoRecord: boolean;
    passcodeRequired: boolean;
  }>().default({
    waitingRoomEnabled: true,
    allowParticipantScreenShare: true,
    allowParticipantChat: true,
    muteOnEntry: false,
    autoRecord: false,
    passcodeRequired: false,
  }),
  meetingRoomId: text("meeting_room_id"),
  status: text("status").notNull().default("upcoming"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow().$onUpdate(() => new Date()),
});

export const insertScheduleSchema = createInsertSchema(schedulesTable).omit({ id: true, createdAt: true, updatedAt: true });
export type InsertSchedule = z.infer<typeof insertScheduleSchema>;
export type Schedule = typeof schedulesTable.$inferSelect;
