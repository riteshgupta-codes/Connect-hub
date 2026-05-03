/**
 * Connect-Hub orval v8.5.3 🍺
 * Do not edit manually.
 * Api
 * MeetNow API specification
 * OpenAPI spec version: 0.1.0
 */
import { z as zod } from "zod";

export const DailyMeetingCount = zod.object({
  date: zod.string(),
  count: zod.number(),
});

export type DailyMeetingCount = zod.input<typeof DailyMeetingCount>;
