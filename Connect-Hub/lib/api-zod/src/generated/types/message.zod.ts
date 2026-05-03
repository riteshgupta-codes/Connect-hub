/**
 * Connect-Hub orval v8.5.3 🍺
 * Do not edit manually.
 * Api
 * MeetNow API specification
 * OpenAPI spec version: 0.1.0
 */
import { z as zod } from "zod";

export const Message = zod.object({
  id: zod.number(),
  roomId: zod.string(),
  senderId: zod.number().nullish(),
  senderName: zod.string(),
  message: zod.string(),
  type: zod.enum(["text", "system", "reaction"]),
  timestamp: zod.string(),
});

export type Message = zod.input<typeof Message>;
