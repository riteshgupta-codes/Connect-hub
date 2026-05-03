/**
 * Connect-Hub orval v8.5.3 🍺
 * Do not edit manually.
 * Api
 * MeetNow API specification
 * OpenAPI spec version: 0.1.0
 */
export interface HealthStatus {
  status: string;
}

export interface ErrorResponse {
  error: string;
}

export interface SuccessResponse {
  success: boolean;
  message?: string;
}

export type UserPlan = (typeof UserPlan)[keyof typeof UserPlan];

export const UserPlan = {
  free: "free",
  pro: "pro",
  business: "business",
} as const;

export interface User {
  id: number;
  name: string;
  email: string;
  /** @nullable */
  displayName?: string | null;
  /** @nullable */
  avatar?: string | null;
  plan: UserPlan;
  createdAt: string;
}

export interface AuthResponse {
  user: User;
  token: string;
}

export interface RegisterBody {
  /** @minLength 2 */
  name: string;
  email: string;
  /** @minLength 8 */
  password: string;
}

export interface LoginBody {
  email: string;
  password: string;
}

export type UpdateProfileBodyPreferencesTheme =
  (typeof UpdateProfileBodyPreferencesTheme)[keyof typeof UpdateProfileBodyPreferencesTheme];

export const UpdateProfileBodyPreferencesTheme = {
  light: "light",
  dark: "dark",
  system: "system",
} as const;

export type UpdateProfileBodyPreferences = {
  defaultMicOn?: boolean;
  defaultCameraOn?: boolean;
  noiseCancel?: boolean;
  theme?: UpdateProfileBodyPreferencesTheme;
};

export interface UpdateProfileBody {
  name?: string;
  displayName?: string;
  avatar?: string;
  preferences?: UpdateProfileBodyPreferences;
}

export interface ChangePasswordBody {
  currentPassword: string;
  /** @minLength 8 */
  newPassword: string;
}

export interface MeetingSettings {
  waitingRoomEnabled?: boolean;
  allowParticipantScreenShare?: boolean;
  allowParticipantChat?: boolean;
  muteOnEntry?: boolean;
  autoRecord?: boolean;
  passcodeRequired?: boolean;
}

export type MeetingStatus = (typeof MeetingStatus)[keyof typeof MeetingStatus];

export const MeetingStatus = {
  active: "active",
  ended: "ended",
  scheduled: "scheduled",
} as const;

export interface Meeting {
  id: number;
  roomId: string;
  title: string;
  hostId: number;
  hostName: string;
  status: MeetingStatus;
  isLocked: boolean;
  settings: MeetingSettings;
  participantCount: number;
  /** @nullable */
  duration?: number | null;
  /** @nullable */
  startedAt?: string | null;
  /** @nullable */
  endedAt?: string | null;
  createdAt: string;
}

export interface MeetingListResponse {
  meetings: Meeting[];
  total: number;
  page: number;
  limit: number;
}

export interface CreateMeetingBody {
  title?: string;
  settings?: MeetingSettings;
  passcode?: string;
}

export type UpdateMeetingBodyStatus =
  (typeof UpdateMeetingBodyStatus)[keyof typeof UpdateMeetingBodyStatus];

export const UpdateMeetingBodyStatus = {
  active: "active",
  ended: "ended",
  scheduled: "scheduled",
} as const;

export interface UpdateMeetingBody {
  title?: string;
  status?: UpdateMeetingBodyStatus;
  isLocked?: boolean;
  settings?: MeetingSettings;
}

export interface VerifyPasscodeBody {
  passcode: string;
}

export type MessageType = (typeof MessageType)[keyof typeof MessageType];

export const MessageType = {
  text: "text",
  system: "system",
  reaction: "reaction",
} as const;

export interface Message {
  id: number;
  roomId: string;
  /** @nullable */
  senderId?: number | null;
  senderName: string;
  message: string;
  type: MessageType;
  timestamp: string;
}

export type ScheduleStatus =
  (typeof ScheduleStatus)[keyof typeof ScheduleStatus];

export const ScheduleStatus = {
  upcoming: "upcoming",
  started: "started",
  cancelled: "cancelled",
} as const;

export interface Schedule {
  id: number;
  hostId: number;
  title: string;
  /** @nullable */
  description?: string | null;
  scheduledFor: string;
  durationMinutes: number;
  invitees: string[];
  /** @nullable */
  passcode?: string | null;
  settings: MeetingSettings;
  status: ScheduleStatus;
  /** @nullable */
  meetingRoomId?: string | null;
  createdAt: string;
}

export type CreateScheduleBodyDurationMinutes =
  (typeof CreateScheduleBodyDurationMinutes)[keyof typeof CreateScheduleBodyDurationMinutes];

export const CreateScheduleBodyDurationMinutes = {
  NUMBER_15: 15,
  NUMBER_30: 30,
  NUMBER_45: 45,
  NUMBER_60: 60,
  NUMBER_90: 90,
  NUMBER_120: 120,
} as const;

export interface CreateScheduleBody {
  title: string;
  description?: string;
  scheduledFor: string;
  durationMinutes: CreateScheduleBodyDurationMinutes;
  invitees?: string[];
  passcode?: string;
  settings?: MeetingSettings;
}

export type UpdateScheduleBodyStatus =
  (typeof UpdateScheduleBodyStatus)[keyof typeof UpdateScheduleBodyStatus];

export const UpdateScheduleBodyStatus = {
  upcoming: "upcoming",
  started: "started",
  cancelled: "cancelled",
} as const;

export interface UpdateScheduleBody {
  title?: string;
  description?: string;
  scheduledFor?: string;
  durationMinutes?: number;
  invitees?: string[];
  status?: UpdateScheduleBodyStatus;
}

export interface DailyMeetingCount {
  date: string;
  count: number;
}

export interface TopContact {
  name: string;
  meetingCount: number;
}

export interface UserAnalytics {
  totalMeetings: number;
  totalHoursMinutes: string;
  totalMessages: number;
  uniquePeopleMet: number;
  meetingsHosted: number;
  meetingsJoined: number;
  dailyCounts: DailyMeetingCount[];
  topContacts: TopContact[];
}

export interface AnalyticsOverview {
  meetingsThisMonth: number;
  totalHours: string;
  peopleMet: number;
  messagesSent: number;
}

export type GetMeetingHistoryParams = {
  page?: number;
  limit?: number;
  status?: GetMeetingHistoryStatus;
  filter?: GetMeetingHistoryFilter;
};

export type GetMeetingHistoryStatus =
  (typeof GetMeetingHistoryStatus)[keyof typeof GetMeetingHistoryStatus];

export const GetMeetingHistoryStatus = {
  active: "active",
  ended: "ended",
  scheduled: "scheduled",
} as const;

export type GetMeetingHistoryFilter =
  (typeof GetMeetingHistoryFilter)[keyof typeof GetMeetingHistoryFilter];

export const GetMeetingHistoryFilter = {
  all: "all",
  hosted: "hosted",
  joined: "joined",
} as const;

export type GetMeetingMessagesParams = {
  page?: number;
  limit?: number;
};

export type GetSchedulesParams = {
  status?: GetSchedulesStatus;
  page?: number;
  limit?: number;
};

export type GetSchedulesStatus =
  (typeof GetSchedulesStatus)[keyof typeof GetSchedulesStatus];

export const GetSchedulesStatus = {
  upcoming: "upcoming",
  started: "started",
  cancelled: "cancelled",
  all: "all",
} as const;

export type GetUserAnalyticsParams = {
  from?: string;
  to?: string;
  range?: GetUserAnalyticsRange;
};

export type GetUserAnalyticsRange =
  (typeof GetUserAnalyticsRange)[keyof typeof GetUserAnalyticsRange];

export const GetUserAnalyticsRange = {
  "7d": "7d",
  "30d": "30d",
  "90d": "90d",
  "1y": "1y",
} as const;
