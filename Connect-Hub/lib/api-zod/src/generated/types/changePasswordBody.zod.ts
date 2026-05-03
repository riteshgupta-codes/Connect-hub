/**
 * Connect-Hub orval v8.5.3 🍺
 * Do not edit manually.
 * Api
 * MeetNow API specification
 * OpenAPI spec version: 0.1.0
 */
import { z as zod } from "zod";

export const changePasswordBodyNewPasswordMinTwo = 8;

export const ChangePasswordBody = zod.object({
  currentPassword: zod.string(),
  newPassword: zod.string().min(changePasswordBodyNewPasswordMinTwo),
});

export type ChangePasswordBody = zod.input<typeof ChangePasswordBody>;
