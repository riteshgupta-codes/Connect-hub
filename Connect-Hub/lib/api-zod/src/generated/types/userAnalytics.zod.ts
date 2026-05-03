/**
 * Connect-Hub orval v8.5.3 🍺
 * Do not edit manually.
 * Api
 * MeetNow API specification
 * OpenAPI spec version: 0.1.0
 */
import { z as zod } from "zod";

export const UserAnalytics = zod.object({
  totalMeetings: zod.number(),
  totalHoursMinutes: zod.string(),
  totalMessages: zod.number(),
  uniquePeopleMet: zod.number(),
  meetingsHosted: zod.number(),
  meetingsJoined: zod.number(),
  dailyCounts: zod.array(
    zod.object({
      date: zod.string(),
      count: zod.number(),
    }),
  ),
  topContacts: zod.array(
    zod.object({
      name: zod.string(),
      meetingCount: zod.number(),
    }),
  ),
});

export type UserAnalytics = zod.input<typeof UserAnalytics>;
