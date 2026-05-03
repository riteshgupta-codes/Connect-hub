/**
 * Connect-Hub orval v8.5.3 🍺
 * Do not edit manually.
 * Api
 * MeetNow API specification
 * OpenAPI spec version: 0.1.0
 */
import { z as zod } from "zod";

export const UpdateScheduleBody = zod.object({
  title: zod.string().optional(),
  description: zod.string().optional(),
  scheduledFor: zod.string().optional(),
  durationMinutes: zod.number().optional(),
  invitees: zod.array(zod.string()).optional(),
  status: zod.enum(["upcoming", "started", "cancelled"]).optional(),
});

export type UpdateScheduleBody = zod.input<typeof UpdateScheduleBody>;
