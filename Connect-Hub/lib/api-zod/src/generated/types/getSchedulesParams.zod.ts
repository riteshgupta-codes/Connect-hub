/**
 * Connect-Hub orval v8.5.3 🍺
 * Do not edit manually.
 * Api
 * MeetNow API specification
 * OpenAPI spec version: 0.1.0
 */
import { z as zod } from "zod";

export const getSchedulesParamsPageDefault = 1;
export const getSchedulesParamsLimitDefault = 10;
export const GetSchedulesParams = zod.object({
  status: zod.enum(["upcoming", "started", "cancelled", "all"]).optional(),
  page: zod.number().default(getSchedulesParamsPageDefault),
  limit: zod.number().default(getSchedulesParamsLimitDefault),
});

export type GetSchedulesParams = zod.input<typeof GetSchedulesParams>;
