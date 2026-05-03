/**
 * Connect-Hub orval v8.5.3 🍺
 * Do not edit manually.
 * Api
 * MeetNow API specification
 * OpenAPI spec version: 0.1.0
 */
import { z as zod } from "zod";

export const SuccessResponse = zod.object({
  success: zod.boolean(),
  message: zod.string().optional(),
});

export type SuccessResponse = zod.input<typeof SuccessResponse>;
