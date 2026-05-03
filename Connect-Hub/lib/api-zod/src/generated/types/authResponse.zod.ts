/**
 * Connect-Hub orval v8.5.3 🍺
 * Do not edit manually.
 * Api
 * MeetNow API specification
 * OpenAPI spec version: 0.1.0
 */
import { z as zod } from "zod";

export const AuthResponse = zod.object({
  user: zod.object({
    id: zod.number(),
    name: zod.string(),
    email: zod.string(),
    displayName: zod.string().nullish(),
    avatar: zod.string().nullish(),
    plan: zod.enum(["free", "pro", "business"]),
    createdAt: zod.string(),
  }),
  token: zod.string(),
});

export type AuthResponse = zod.input<typeof AuthResponse>;
