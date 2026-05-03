/**
 * Connect-Hub orval v8.5.3 🍺
 * Do not edit manually.
 * Api
 * MeetNow API specification
 * OpenAPI spec version: 0.1.0
 */
import { z as zod } from "zod";

export const MeetingListResponse = zod.object({
  meetings: zod.array(
    zod.object({
      id: zod.number(),
      roomId: zod.string(),
      title: zod.string(),
      hostId: zod.number(),
      hostName: zod.string(),
      status: zod.enum(["active", "ended", "scheduled"]),
      isLocked: zod.boolean(),
      settings: zod.object({
        waitingRoomEnabled: zod.boolean().optional(),
        allowParticipantScreenShare: zod.boolean().optional(),
        allowParticipantChat: zod.boolean().optional(),
        muteOnEntry: zod.boolean().optional(),
        autoRecord: zod.boolean().optional(),
        passcodeRequired: zod.boolean().optional(),
      }),
      participantCount: zod.number(),
      duration: zod.number().nullish(),
      startedAt: zod.string().nullish(),
      endedAt: zod.string().nullish(),
      createdAt: zod.string(),
    }),
  ),
  total: zod.number(),
  page: zod.number(),
  limit: zod.number(),
});

export type MeetingListResponse = zod.input<typeof MeetingListResponse>;
