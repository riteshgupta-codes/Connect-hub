/**
 * Connect-Hub orval v8.5.3 🍺
 * Do not edit manually.
 * Api
 * MeetNow API specification
 * OpenAPI spec version: 0.1.0
 */
import { z as zod } from "zod";

export const Schedule = zod.object({
  id: zod.number(),
  hostId: zod.number(),
  title: zod.string(),
  description: zod.string().nullish(),
  scheduledFor: zod.string(),
  durationMinutes: zod.number(),
  invitees: zod.array(zod.string()),
  passcode: zod.string().nullish(),
  settings: zod.object({
    waitingRoomEnabled: zod.boolean().optional(),
    allowParticipantScreenShare: zod.boolean().optional(),
    allowParticipantChat: zod.boolean().optional(),
    muteOnEntry: zod.boolean().optional(),
    autoRecord: zod.boolean().optional(),
    passcodeRequired: zod.boolean().optional(),
  }),
  status: zod.enum(["upcoming", "started", "cancelled"]),
  meetingRoomId: zod.string().nullish(),
  createdAt: zod.string(),
});

export type Schedule = zod.input<typeof Schedule>;
