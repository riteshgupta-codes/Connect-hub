/**
 * Connect-Hub orval v8.5.3 🍺
 * Do not edit manually.
 * Api
 * MeetNow API specification
 * OpenAPI spec version: 0.1.0
 */
import { z as zod } from "zod";

export const VerifyMeetingPasscodeBody = zod.object({
  passcode: zod.string(),
});

export type VerifyMeetingPasscodeBody = zod.input<
  typeof VerifyMeetingPasscodeBody
>;
