/**
 * Connect-Hub orval v8.5.3 🍺
 * Do not edit manually.
 * Api
 * MeetNow API specification
 * OpenAPI spec version: 0.1.0
 */
import { z as zod } from "zod";

export const getMeetingHistoryParamsPageDefault = 1;
export const getMeetingHistoryParamsLimitDefault = 10;
export const GetMeetingHistoryParams = zod.object({
  page: zod.number().default(getMeetingHistoryParamsPageDefault),
  limit: zod.number().default(getMeetingHistoryParamsLimitDefault),
  status: zod.enum(["active", "ended", "scheduled"]).optional(),
  filter: zod.enum(["all", "hosted", "joined"]).optional(),
});

export type GetMeetingHistoryParams = zod.input<typeof GetMeetingHistoryParams>;
