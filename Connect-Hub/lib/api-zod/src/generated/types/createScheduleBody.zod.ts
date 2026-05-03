/**
 * Connect-Hub orval v8.5.3 🍺
 * Do not edit manually.
 * Api
 * MeetNow API specification
 * OpenAPI spec version: 0.1.0
 */
import { z as zod } from "zod";

export const CreateScheduleBody = zod.object({
  title: zod.string(),
  description: zod.string().optional(),
  scheduledFor: zod.string(),
  durationMinutes: zod.union([
    zod.literal(15),
    zod.literal(30),
    zod.literal(45),
    zod.literal(60),
    zod.literal(90),
    zod.literal(120),
  ]),
  invitees: zod.array(zod.string()).optional(),
  passcode: zod.string().optional(),
  settings: zod
    .object({
      waitingRoomEnabled: zod.boolean().optional(),
      allowParticipantScreenShare: zod.boolean().optional(),
      allowParticipantChat: zod.boolean().optional(),
      muteOnEntry: zod.boolean().optional(),
      autoRecord: zod.boolean().optional(),
      passcodeRequired: zod.boolean().optional(),
    })
    .optional(),
});

export type CreateScheduleBody = zod.input<typeof CreateScheduleBody>;
