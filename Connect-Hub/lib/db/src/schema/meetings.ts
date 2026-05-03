import { pgTable, text, serial, timestamp, jsonb, boolean, integer } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const meetingsTable = pgTable("meetings", {
  id: serial("id").primaryKey(),
  roomId: text("room_id").notNull().unique(),
  title: text("title").notNull(),
  hostId: integer("host_id").notNull(),
  passcodeHash: text("passcode_hash"),
  status: text("status").notNull().default("active"),
  isLocked: boolean("is_locked").notNull().default(false),
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
  participantCount: integer("participant_count").notNull().default(0),
  durationSeconds: integer("duration_seconds"),
  startedAt: timestamp("started_at", { withTimezone: true }),
  endedAt: timestamp("ended_at", { withTimezone: true }),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow().$onUpdate(() => new Date()),
});

export const insertMeetingSchema = createInsertSchema(meetingsTable).omit({ id: true, createdAt: true, updatedAt: true });
export type InsertMeeting = z.infer<typeof insertMeetingSchema>;
export type Meeting = typeof meetingsTable.$inferSelect;
