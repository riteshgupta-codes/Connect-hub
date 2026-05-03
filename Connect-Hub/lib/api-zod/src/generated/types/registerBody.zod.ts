/**
 * Connect-Hub orval v8.5.3 🍺
 * Do not edit manually.
 * Api
 * MeetNow API specification
 * OpenAPI spec version: 0.1.0
 */
import { z as zod } from "zod";

export const registerBodyNameMin = 2;

export const registerBodyPasswordMin = 8;

export const RegisterBody = zod.object({
  name: zod.string().min(registerBodyNameMin),
  email: zod.string().email(),
  password: zod.string().min(registerBodyPasswordMin),
});

export type RegisterBody = zod.input<typeof RegisterBody>;
