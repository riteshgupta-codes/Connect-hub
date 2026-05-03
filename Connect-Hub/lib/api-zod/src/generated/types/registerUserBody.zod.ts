/**
 * Connect-Hub orval v8.5.3 🍺
 * Do not edit manually.
 * Api
 * MeetNow API specification
 * OpenAPI spec version: 0.1.0
 */
import { z as zod } from "zod";

export const registerUserBodyNameMinOne = 2;

export const registerUserBodyPasswordMinOne = 8;

export const RegisterUserBody = zod.object({
  name: zod.string().min(registerUserBodyNameMinOne),
  email: zod.string().email(),
  password: zod.string().min(registerUserBodyPasswordMinOne),
});

export type RegisterUserBody = zod.input<typeof RegisterUserBody>;
