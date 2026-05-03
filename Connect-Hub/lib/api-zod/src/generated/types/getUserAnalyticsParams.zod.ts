/**
 * Connect-Hub orval v8.5.3 🍺
 * Do not edit manually.
 * Api
 * MeetNow API specification
 * OpenAPI spec version: 0.1.0
 */
import { z as zod } from "zod";

export const GetUserAnalyticsParams = zod.object({
  from: zod.string().optional(),
  to: zod.string().optional(),
  range: zod.enum(["7d", "30d", "90d", "1y"]).optional(),
});

export type GetUserAnalyticsParams = zod.input<typeof GetUserAnalyticsParams>;
