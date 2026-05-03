/**
 * Connect-Hub orval v8.5.3 🍺
 * Do not edit manually.
 * Api
 * MeetNow API specification
 * OpenAPI spec version: 0.1.0
 */
import { z as zod } from "zod";

export const UpdateMeetingBody = zod.object({
  title: zod.string().optional(),
  status: zod.enum(["active", "ended", "scheduled"]).optional(),
  isLocked: zod.boolean().optional(),
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

export type UpdateMeetingBody = zod.input<typeof UpdateMeetingBody>;
