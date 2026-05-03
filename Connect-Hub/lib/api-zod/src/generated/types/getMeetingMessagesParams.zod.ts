/**
 * Connect-Hub orval v8.5.3 🍺
 * Do not edit manually.
 * Api
 * MeetNow API specification
 * OpenAPI spec version: 0.1.0
 */
import { z as zod } from "zod";

export const getMeetingMessagesParamsPageDefault = 1;
export const getMeetingMessagesParamsLimitDefault = 50;
export const GetMeetingMessagesParams = zod.object({
  page: zod.number().default(getMeetingMessagesParamsPageDefault),
  limit: zod.number().default(getMeetingMessagesParamsLimitDefault),
});

export type GetMeetingMessagesParams = zod.input<
  typeof GetMeetingMessagesParams
>;
