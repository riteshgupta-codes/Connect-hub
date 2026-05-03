/**
 * Connect-Hub orval v8.5.3 🍺
 * Do not edit manually.
 * Api
 * MeetNow API specification
 * OpenAPI spec version: 0.1.0
 */
import * as zod from "zod";

/**
 * @summary Health check
 */
export const HealthCheckResponse = zod.object({
  status: zod.string(),
});

/**
 * @summary Register a new user
 */
export const registerUserBodyNameMin = 2;

export const registerUserBodyPasswordMin = 8;

export const RegisterUserBody = zod.object({
  name: zod.string().min(registerUserBodyNameMin),
  email: zod.string().email(),
  password: zod.string().min(registerUserBodyPasswordMin),
});

/**
 * @summary Login
 */
export const LoginUserBody = zod.object({
  email: zod.string().email(),
  password: zod.string(),
});

export const LoginUserResponse = zod.object({
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

/**
 * @summary Logout
 */
export const LogoutUserResponse = zod.object({
  success: zod.boolean(),
  message: zod.string().optional(),
});

/**
 * @summary Get current user
 */
export const GetMeResponse = zod.object({
  id: zod.number(),
  name: zod.string(),
  email: zod.string(),
  displayName: zod.string().nullish(),
  avatar: zod.string().nullish(),
  plan: zod.enum(["free", "pro", "business"]),
  createdAt: zod.string(),
});

/**
 * @summary Update user profile
 */
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

export const UpdateProfileResponse = zod.object({
  id: zod.number(),
  name: zod.string(),
  email: zod.string(),
  displayName: zod.string().nullish(),
  avatar: zod.string().nullish(),
  plan: zod.enum(["free", "pro", "business"]),
  createdAt: zod.string(),
});

/**
 * @summary Change password
 */
export const changePasswordBodyNewPasswordMin = 8;

export const ChangePasswordBody = zod.object({
  currentPassword: zod.string(),
  newPassword: zod.string().min(changePasswordBodyNewPasswordMin),
});

export const ChangePasswordResponse = zod.object({
  success: zod.boolean(),
  message: zod.string().optional(),
});

/**
 * @summary Create a new meeting
 */
export const CreateMeetingBody = zod.object({
  title: zod.string().optional(),
  settings: zod
    .object({
      waitingRoomEnabled: zod.boolean().optional(),
      allowParticipantScreenShare: zod.boolean().optional(),
      allowParticipantChat: zod.boolean().optional(),
      muteOnEntry: zod.boolean().optional(),
      autoRecord: zod.boolean().optional(),
      passcodeRequired: zod.boolean().optional(),
    })
    .optional(),
  passcode: zod.string().optional(),
});

/**
 * @summary Get meeting history
 */
export const getMeetingHistoryQueryPageDefault = 1;
export const getMeetingHistoryQueryLimitDefault = 10;

export const GetMeetingHistoryQueryParams = zod.object({
  page: zod.coerce.number().default(getMeetingHistoryQueryPageDefault),
  limit: zod.coerce.number().default(getMeetingHistoryQueryLimitDefault),
  status: zod.enum(["active", "ended", "scheduled"]).optional(),
  filter: zod.enum(["all", "hosted", "joined"]).optional(),
});

export const GetMeetingHistoryResponse = zod.object({
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

/**
 * @summary Get meeting by roomId
 */
export const GetMeetingParams = zod.object({
  roomId: zod.coerce.string(),
});

export const GetMeetingResponse = zod.object({
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
});

/**
 * @summary Update meeting
 */
export const UpdateMeetingParams = zod.object({
  roomId: zod.coerce.string(),
});

export const UpdateMeetingBody = zod.object({
  title: zod.string().optional(),
  status: zod.enum(["active", "ended", "scheduled"]).optional(),
  isLocked: zod.boolean().optional(),
  settings: zod
    .object({
      waitingRoomEnabled: zod.boolean().optional(),
      allowParticipantScreenShare: zod.boolean().optional(),
      allowParticipantChat: zod.boolean().optional(),
      muteOnEntry: zod.boolean().optional(),
      autoRecord: zod.boolean().optional(),
      passcodeRequired: zod.boolean().optional(),
    })
    .optional(),
});

export const UpdateMeetingResponse = zod.object({
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
});

/**
 * @summary Delete meeting
 */
export const DeleteMeetingParams = zod.object({
  roomId: zod.coerce.string(),
});

/**
 * @summary Verify meeting passcode
 */
export const VerifyMeetingPasscodeParams = zod.object({
  roomId: zod.coerce.string(),
});

export const VerifyMeetingPasscodeBody = zod.object({
  passcode: zod.string(),
});

export const VerifyMeetingPasscodeResponse = zod.object({
  success: zod.boolean(),
  message: zod.string().optional(),
});

/**
 * @summary Get meeting chat messages
 */
export const GetMeetingMessagesParams = zod.object({
  roomId: zod.coerce.string(),
});

export const getMeetingMessagesQueryPageDefault = 1;
export const getMeetingMessagesQueryLimitDefault = 50;

export const GetMeetingMessagesQueryParams = zod.object({
  page: zod.coerce.number().default(getMeetingMessagesQueryPageDefault),
  limit: zod.coerce.number().default(getMeetingMessagesQueryLimitDefault),
});

export const GetMeetingMessagesResponseItem = zod.object({
  id: zod.number(),
  roomId: zod.string(),
  senderId: zod.number().nullish(),
  senderName: zod.string(),
  message: zod.string(),
  type: zod.enum(["text", "system", "reaction"]),
  timestamp: zod.string(),
});
export const GetMeetingMessagesResponse = zod.array(
  GetMeetingMessagesResponseItem,
);

/**
 * @summary Schedule a meeting
 */
export const CreateScheduleBody = zod.object({
  title: zod.string(),
  description: zod.string().optional(),
  scheduledFor: zod.string(),
  durationMinutes: zod.union([
    zod.literal(15),
    zod.literal(30),
    zod.literal(45),
    zod.literal(60),
    zod.literal(90),
    zod.literal(120),
  ]),
  invitees: zod.array(zod.string()).optional(),
  passcode: zod.string().optional(),
  settings: zod
    .object({
      waitingRoomEnabled: zod.boolean().optional(),
      allowParticipantScreenShare: zod.boolean().optional(),
      allowParticipantChat: zod.boolean().optional(),
      muteOnEntry: zod.boolean().optional(),
      autoRecord: zod.boolean().optional(),
      passcodeRequired: zod.boolean().optional(),
    })
    .optional(),
});

/**
 * @summary Get schedules
 */
export const getSchedulesQueryPageDefault = 1;
export const getSchedulesQueryLimitDefault = 10;

export const GetSchedulesQueryParams = zod.object({
  status: zod.enum(["upcoming", "started", "cancelled", "all"]).optional(),
  page: zod.coerce.number().default(getSchedulesQueryPageDefault),
  limit: zod.coerce.number().default(getSchedulesQueryLimitDefault),
});

export const GetSchedulesResponseItem = zod.object({
  id: zod.number(),
  hostId: zod.number(),
  title: zod.string(),
  description: zod.string().nullish(),
  scheduledFor: zod.string(),
  durationMinutes: zod.number(),
  invitees: zod.array(zod.string()),
  passcode: zod.string().nullish(),
  settings: zod.object({
    waitingRoomEnabled: zod.boolean().optional(),
    allowParticipantScreenShare: zod.boolean().optional(),
    allowParticipantChat: zod.boolean().optional(),
    muteOnEntry: zod.boolean().optional(),
    autoRecord: zod.boolean().optional(),
    passcodeRequired: zod.boolean().optional(),
  }),
  status: zod.enum(["upcoming", "started", "cancelled"]),
  meetingRoomId: zod.string().nullish(),
  createdAt: zod.string(),
});
export const GetSchedulesResponse = zod.array(GetSchedulesResponseItem);

/**
 * @summary Get schedule by id
 */
export const GetScheduleParams = zod.object({
  id: zod.coerce.number(),
});

export const GetScheduleResponse = zod.object({
  id: zod.number(),
  hostId: zod.number(),
  title: zod.string(),
  description: zod.string().nullish(),
  scheduledFor: zod.string(),
  durationMinutes: zod.number(),
  invitees: zod.array(zod.string()),
  passcode: zod.string().nullish(),
  settings: zod.object({
    waitingRoomEnabled: zod.boolean().optional(),
    allowParticipantScreenShare: zod.boolean().optional(),
    allowParticipantChat: zod.boolean().optional(),
    muteOnEntry: zod.boolean().optional(),
    autoRecord: zod.boolean().optional(),
    passcodeRequired: zod.boolean().optional(),
  }),
  status: zod.enum(["upcoming", "started", "cancelled"]),
  meetingRoomId: zod.string().nullish(),
  createdAt: zod.string(),
});

/**
 * @summary Update schedule
 */
export const UpdateScheduleParams = zod.object({
  id: zod.coerce.number(),
});

export const UpdateScheduleBody = zod.object({
  title: zod.string().optional(),
  description: zod.string().optional(),
  scheduledFor: zod.string().optional(),
  durationMinutes: zod.number().optional(),
  invitees: zod.array(zod.string()).optional(),
  status: zod.enum(["upcoming", "started", "cancelled"]).optional(),
});

export const UpdateScheduleResponse = zod.object({
  id: zod.number(),
  hostId: zod.number(),
  title: zod.string(),
  description: zod.string().nullish(),
  scheduledFor: zod.string(),
  durationMinutes: zod.number(),
  invitees: zod.array(zod.string()),
  passcode: zod.string().nullish(),
  settings: zod.object({
    waitingRoomEnabled: zod.boolean().optional(),
    allowParticipantScreenShare: zod.boolean().optional(),
    allowParticipantChat: zod.boolean().optional(),
    muteOnEntry: zod.boolean().optional(),
    autoRecord: zod.boolean().optional(),
    passcodeRequired: zod.boolean().optional(),
  }),
  status: zod.enum(["upcoming", "started", "cancelled"]),
  meetingRoomId: zod.string().nullish(),
  createdAt: zod.string(),
});

/**
 * @summary Cancel/delete a schedule
 */
export const DeleteScheduleParams = zod.object({
  id: zod.coerce.number(),
});

/**
 * @summary Get user analytics
 */
export const GetUserAnalyticsQueryParams = zod.object({
  from: zod.coerce.string().optional(),
  to: zod.coerce.string().optional(),
  range: zod.enum(["7d", "30d", "90d", "1y"]).optional(),
});

export const GetUserAnalyticsResponse = zod.object({
  totalMeetings: zod.number(),
  totalHoursMinutes: zod.string(),
  totalMessages: zod.number(),
  uniquePeopleMet: zod.number(),
  meetingsHosted: zod.number(),
  meetingsJoined: zod.number(),
  dailyCounts: zod.array(
    zod.object({
      date: zod.string(),
      count: zod.number(),
    }),
  ),
  topContacts: zod.array(
    zod.object({
      name: zod.string(),
      meetingCount: zod.number(),
    }),
  ),
});

/**
 * @summary Get quick analytics overview for dashboard
 */
export const GetAnalyticsOverviewResponse = zod.object({
  meetingsThisMonth: zod.number(),
  totalHours: zod.string(),
  peopleMet: zod.number(),
  messagesSent: zod.number(),
});
