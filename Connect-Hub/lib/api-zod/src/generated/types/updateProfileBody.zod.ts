/**
 * Connect-Hub orval v8.5.3 🍺
 * Do not edit manually.
 * Api
 * MeetNow API specification
 * OpenAPI spec version: 0.1.0
 */
import { z as zod } from "zod";

export const UpdateProfileBody = zod.object({
  name: zod.string().optional(),
  displayName: zod.string().optional(),
  avatar: zod.string().optional(),
  preferences: zod
    .object({
      defaultMicOn: zod.boolean().optional(),
      defaultCameraOn: zod.boolean().optional(),
      noiseCancel: zod.boolean().optional(),
      theme: zod.enum(["light", "dark", "system"]).optional(),
    })
    .optional(),
});

export type UpdateProfileBody = zod.input<typeof UpdateProfileBody>;
