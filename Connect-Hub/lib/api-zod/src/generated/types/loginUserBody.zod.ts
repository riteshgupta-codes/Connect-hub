/**
 * Connect-Hub orval v8.5.3 🍺
 * Do not edit manually.
 * Api
 * MeetNow API specification
 * OpenAPI spec version: 0.1.0
 */
import { z as zod } from "zod";

export const LoginUserBody = zod.object({
  email: zod.string().email(),
  password: zod.string(),
});

export type LoginUserBody = zod.input<typeof LoginUserBody>;
