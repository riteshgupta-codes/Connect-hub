/**
 * Connect-Hub orval v8.5.3 🍺
 * Do not edit manually.
 * Api
 * MeetNow API specification
 * OpenAPI spec version: 0.1.0
 */
import { useMutation, useQuery } from "@tanstack/react-query";
import type {
  MutationFunction,
  QueryFunction,
  QueryKey,
  UseMutationOptions,
  UseMutationResult,
  UseQueryOptions,
  UseQueryResult,
} from "@tanstack/react-query";

import type {
  AnalyticsOverview,
  AuthResponse,
  ChangePasswordBody,
  CreateMeetingBody,
  CreateScheduleBody,
  ErrorResponse,
  GetMeetingHistoryParams,
  GetMeetingMessagesParams,
  GetSchedulesParams,
  GetUserAnalyticsParams,
  HealthStatus,
  LoginBody,
  Meeting,
  MeetingListResponse,
  Message,
  RegisterBody,
  Schedule,
  SuccessResponse,
  UpdateMeetingBody,
  UpdateProfileBody,
  UpdateScheduleBody,
  User,
  UserAnalytics,
  VerifyPasscodeBody,
} from "./api.schemas";

import { customFetch } from "../custom-fetch";
import type { ErrorType, BodyType } from "../custom-fetch";

type AwaitedInput<T> = PromiseLike<T> | T;

type Awaited<O> = O extends AwaitedInput<infer T> ? T : never;

type SecondParameter<T extends (...args: never) => unknown> = Parameters<T>[1];

/**
 * @summary Health check
 */
export const getHealthCheckUrl = () => {
  return `/api/healthz`;
};

export const healthCheck = async (
  options?: RequestInit,
): Promise<HealthStatus> => {
  return customFetch<HealthStatus>(getHealthCheckUrl(), {
    ...options,
    method: "GET",
  });
};

export const getHealthCheckQueryKey = () => {
  return [`/api/healthz`] as const;
};

export const getHealthCheckQueryOptions = <
  TData = Awaited<ReturnType<typeof healthCheck>>,
  TError = ErrorType<unknown>,
>(options?: {
  query?: UseQueryOptions<
    Awaited<ReturnType<typeof healthCheck>>,
    TError,
    TData
  >;
  request?: SecondParameter<typeof customFetch>;
}) => {
  const { query: queryOptions, request: requestOptions } = options ?? {};

  const queryKey = queryOptions?.queryKey ?? getHealthCheckQueryKey();

  const queryFn: QueryFunction<Awaited<ReturnType<typeof healthCheck>>> = ({
    signal,
  }) => healthCheck({ signal, ...requestOptions });

  return { queryKey, queryFn, ...queryOptions } as UseQueryOptions<
    Awaited<ReturnType<typeof healthCheck>>,
    TError,
    TData
  > & { queryKey: QueryKey };
};

export type HealthCheckQueryResult = NonNullable<
  Awaited<ReturnType<typeof healthCheck>>
>;
export type HealthCheckQueryError = ErrorType<unknown>;

/**
 * @summary Health check
 */

export function useHealthCheck<
  TData = Awaited<ReturnType<typeof healthCheck>>,
  TError = ErrorType<unknown>,
>(options?: {
  query?: UseQueryOptions<
    Awaited<ReturnType<typeof healthCheck>>,
    TError,
    TData
  >;
  request?: SecondParameter<typeof customFetch>;
}): UseQueryResult<TData, TError> & { queryKey: QueryKey } {
  const queryOptions = getHealthCheckQueryOptions(options);

  const query = useQuery(queryOptions) as UseQueryResult<TData, TError> & {
    queryKey: QueryKey;
  };

  return { ...query, queryKey: queryOptions.queryKey };
}

/**
 * @summary Register a new user
 */
export const getRegisterUserUrl = () => {
  return `/api/v1/auth/register`;
};

export const registerUser = async (
  registerBody: RegisterBody,
  options?: RequestInit,
): Promise<AuthResponse> => {
  return customFetch<AuthResponse>(getRegisterUserUrl(), {
    ...options,
    method: "POST",
    headers: { "Content-Type": "application/json", ...options?.headers },
    body: JSON.stringify(registerBody),
  });
};

export const getRegisterUserMutationOptions = <
  TError = ErrorType<ErrorResponse>,
  TContext = unknown,
>(options?: {
  mutation?: UseMutationOptions<
    Awaited<ReturnType<typeof registerUser>>,
    TError,
    { data: BodyType<RegisterBody> },
    TContext
  >;
  request?: SecondParameter<typeof customFetch>;
}): UseMutationOptions<
  Awaited<ReturnType<typeof registerUser>>,
  TError,
  { data: BodyType<RegisterBody> },
  TContext
> => {
  const mutationKey = ["registerUser"];
  const { mutation: mutationOptions, request: requestOptions } = options
    ? options.mutation &&
      "mutationKey" in options.mutation &&
      options.mutation.mutationKey
      ? options
      : { ...options, mutation: { ...options.mutation, mutationKey } }
    : { mutation: { mutationKey }, request: undefined };

  const mutationFn: MutationFunction<
    Awaited<ReturnType<typeof registerUser>>,
    { data: BodyType<RegisterBody> }
  > = (props) => {
    const { data } = props ?? {};

    return registerUser(data, requestOptions);
  };

  return { mutationFn, ...mutationOptions };
};

export type RegisterUserMutationResult = NonNullable<
  Awaited<ReturnType<typeof registerUser>>
>;
export type RegisterUserMutationBody = BodyType<RegisterBody>;
export type RegisterUserMutationError = ErrorType<ErrorResponse>;

/**
 * @summary Register a new user
 */
export const useRegisterUser = <
  TError = ErrorType<ErrorResponse>,
  TContext = unknown,
>(options?: {
  mutation?: UseMutationOptions<
    Awaited<ReturnType<typeof registerUser>>,
    TError,
    { data: BodyType<RegisterBody> },
    TContext
  >;
  request?: SecondParameter<typeof customFetch>;
}): UseMutationResult<
  Awaited<ReturnType<typeof registerUser>>,
  TError,
  { data: BodyType<RegisterBody> },
  TContext
> => {
  return useMutation(getRegisterUserMutationOptions(options));
};

/**
 * @summary Login
 */
export const getLoginUserUrl = () => {
  return `/api/v1/auth/login`;
};

export const loginUser = async (
  loginBody: LoginBody,
  options?: RequestInit,
): Promise<AuthResponse> => {
  return customFetch<AuthResponse>(getLoginUserUrl(), {
    ...options,
    method: "POST",
    headers: { "Content-Type": "application/json", ...options?.headers },
    body: JSON.stringify(loginBody),
  });
};

export const getLoginUserMutationOptions = <
  TError = ErrorType<ErrorResponse>,
  TContext = unknown,
>(options?: {
  mutation?: UseMutationOptions<
    Awaited<ReturnType<typeof loginUser>>,
    TError,
    { data: BodyType<LoginBody> },
    TContext
  >;
  request?: SecondParameter<typeof customFetch>;
}): UseMutationOptions<
  Awaited<ReturnType<typeof loginUser>>,
  TError,
  { data: BodyType<LoginBody> },
  TContext
> => {
  const mutationKey = ["loginUser"];
  const { mutation: mutationOptions, request: requestOptions } = options
    ? options.mutation &&
      "mutationKey" in options.mutation &&
      options.mutation.mutationKey
      ? options
      : { ...options, mutation: { ...options.mutation, mutationKey } }
    : { mutation: { mutationKey }, request: undefined };

  const mutationFn: MutationFunction<
    Awaited<ReturnType<typeof loginUser>>,
    { data: BodyType<LoginBody> }
  > = (props) => {
    const { data } = props ?? {};

    return loginUser(data, requestOptions);
  };

  return { mutationFn, ...mutationOptions };
};

export type LoginUserMutationResult = NonNullable<
  Awaited<ReturnType<typeof loginUser>>
>;
export type LoginUserMutationBody = BodyType<LoginBody>;
export type LoginUserMutationError = ErrorType<ErrorResponse>;

/**
 * @summary Login
 */
export const useLoginUser = <
  TError = ErrorType<ErrorResponse>,
  TContext = unknown,
>(options?: {
  mutation?: UseMutationOptions<
    Awaited<ReturnType<typeof loginUser>>,
    TError,
    { data: BodyType<LoginBody> },
    TContext
  >;
  request?: SecondParameter<typeof customFetch>;
}): UseMutationResult<
  Awaited<ReturnType<typeof loginUser>>,
  TError,
  { data: BodyType<LoginBody> },
  TContext
> => {
  return useMutation(getLoginUserMutationOptions(options));
};

/**
 * @summary Logout
 */
export const getLogoutUserUrl = () => {
  return `/api/v1/auth/logout`;
};

export const logoutUser = async (
  options?: RequestInit,
): Promise<SuccessResponse> => {
  return customFetch<SuccessResponse>(getLogoutUserUrl(), {
    ...options,
    method: "POST",
  });
};

export const getLogoutUserMutationOptions = <
  TError = ErrorType<unknown>,
  TContext = unknown,
>(options?: {
  mutation?: UseMutationOptions<
    Awaited<ReturnType<typeof logoutUser>>,
    TError,
    void,
    TContext
  >;
  request?: SecondParameter<typeof customFetch>;
}): UseMutationOptions<
  Awaited<ReturnType<typeof logoutUser>>,
  TError,
  void,
  TContext
> => {
  const mutationKey = ["logoutUser"];
  const { mutation: mutationOptions, request: requestOptions } = options
    ? options.mutation &&
      "mutationKey" in options.mutation &&
      options.mutation.mutationKey
      ? options
      : { ...options, mutation: { ...options.mutation, mutationKey } }
    : { mutation: { mutationKey }, request: undefined };

  const mutationFn: MutationFunction<
    Awaited<ReturnType<typeof logoutUser>>,
    void
  > = () => {
    return logoutUser(requestOptions);
  };

  return { mutationFn, ...mutationOptions };
};

export type LogoutUserMutationResult = NonNullable<
  Awaited<ReturnType<typeof logoutUser>>
>;

export type LogoutUserMutationError = ErrorType<unknown>;

/**
 * @summary Logout
 */
export const useLogoutUser = <
  TError = ErrorType<unknown>,
  TContext = unknown,
>(options?: {
  mutation?: UseMutationOptions<
    Awaited<ReturnType<typeof logoutUser>>,
    TError,
    void,
    TContext
  >;
  request?: SecondParameter<typeof customFetch>;
}): UseMutationResult<
  Awaited<ReturnType<typeof logoutUser>>,
  TError,
  void,
  TContext
> => {
  return useMutation(getLogoutUserMutationOptions(options));
};

/**
 * @summary Get current user
 */
export const getGetMeUrl = () => {
  return `/api/v1/auth/me`;
};

export const getMe = async (options?: RequestInit): Promise<User> => {
  return customFetch<User>(getGetMeUrl(), {
    ...options,
    method: "GET",
  });
};

export const getGetMeQueryKey = () => {
  return [`/api/v1/auth/me`] as const;
};

export const getGetMeQueryOptions = <
  TData = Awaited<ReturnType<typeof getMe>>,
  TError = ErrorType<ErrorResponse>,
>(options?: {
  query?: UseQueryOptions<Awaited<ReturnType<typeof getMe>>, TError, TData>;
  request?: SecondParameter<typeof customFetch>;
}) => {
  const { query: queryOptions, request: requestOptions } = options ?? {};

  const queryKey = queryOptions?.queryKey ?? getGetMeQueryKey();

  const queryFn: QueryFunction<Awaited<ReturnType<typeof getMe>>> = ({
    signal,
  }) => getMe({ signal, ...requestOptions });

  return { queryKey, queryFn, ...queryOptions } as UseQueryOptions<
    Awaited<ReturnType<typeof getMe>>,
    TError,
    TData
  > & { queryKey: QueryKey };
};

export type GetMeQueryResult = NonNullable<Awaited<ReturnType<typeof getMe>>>;
export type GetMeQueryError = ErrorType<ErrorResponse>;

/**
 * @summary Get current user
 */

export function useGetMe<
  TData = Awaited<ReturnType<typeof getMe>>,
  TError = ErrorType<ErrorResponse>,
>(options?: {
  query?: UseQueryOptions<Awaited<ReturnType<typeof getMe>>, TError, TData>;
  request?: SecondParameter<typeof customFetch>;
}): UseQueryResult<TData, TError> & { queryKey: QueryKey } {
  const queryOptions = getGetMeQueryOptions(options);

  const query = useQuery(queryOptions) as UseQueryResult<TData, TError> & {
    queryKey: QueryKey;
  };

  return { ...query, queryKey: queryOptions.queryKey };
}

/**
 * @summary Update user profile
 */
export const getUpdateProfileUrl = () => {
  return `/api/v1/auth/profile`;
};

export const updateProfile = async (
  updateProfileBody: UpdateProfileBody,
  options?: RequestInit,
): Promise<User> => {
  return customFetch<User>(getUpdateProfileUrl(), {
    ...options,
    method: "PATCH",
    headers: { "Content-Type": "application/json", ...options?.headers },
    body: JSON.stringify(updateProfileBody),
  });
};

export const getUpdateProfileMutationOptions = <
  TError = ErrorType<unknown>,
  TContext = unknown,
>(options?: {
  mutation?: UseMutationOptions<
    Awaited<ReturnType<typeof updateProfile>>,
    TError,
    { data: BodyType<UpdateProfileBody> },
    TContext
  >;
  request?: SecondParameter<typeof customFetch>;
}): UseMutationOptions<
  Awaited<ReturnType<typeof updateProfile>>,
  TError,
  { data: BodyType<UpdateProfileBody> },
  TContext
> => {
  const mutationKey = ["updateProfile"];
  const { mutation: mutationOptions, request: requestOptions } = options
    ? options.mutation &&
      "mutationKey" in options.mutation &&
      options.mutation.mutationKey
      ? options
      : { ...options, mutation: { ...options.mutation, mutationKey } }
    : { mutation: { mutationKey }, request: undefined };

  const mutationFn: MutationFunction<
    Awaited<ReturnType<typeof updateProfile>>,
    { data: BodyType<UpdateProfileBody> }
  > = (props) => {
    const { data } = props ?? {};

    return updateProfile(data, requestOptions);
  };

  return { mutationFn, ...mutationOptions };
};

export type UpdateProfileMutationResult = NonNullable<
  Awaited<ReturnType<typeof updateProfile>>
>;
export type UpdateProfileMutationBody = BodyType<UpdateProfileBody>;
export type UpdateProfileMutationError = ErrorType<unknown>;

/**
 * @summary Update user profile
 */
export const useUpdateProfile = <
  TError = ErrorType<unknown>,
  TContext = unknown,
>(options?: {
  mutation?: UseMutationOptions<
    Awaited<ReturnType<typeof updateProfile>>,
    TError,
    { data: BodyType<UpdateProfileBody> },
    TContext
  >;
  request?: SecondParameter<typeof customFetch>;
}): UseMutationResult<
  Awaited<ReturnType<typeof updateProfile>>,
  TError,
  { data: BodyType<UpdateProfileBody> },
  TContext
> => {
  return useMutation(getUpdateProfileMutationOptions(options));
};

/**
 * @summary Change password
 */
export const getChangePasswordUrl = () => {
  return `/api/v1/auth/change-password`;
};

export const changePassword = async (
  changePasswordBody: ChangePasswordBody,
  options?: RequestInit,
): Promise<SuccessResponse> => {
  return customFetch<SuccessResponse>(getChangePasswordUrl(), {
    ...options,
    method: "POST",
    headers: { "Content-Type": "application/json", ...options?.headers },
    body: JSON.stringify(changePasswordBody),
  });
};

export const getChangePasswordMutationOptions = <
  TError = ErrorType<unknown>,
  TContext = unknown,
>(options?: {
  mutation?: UseMutationOptions<
    Awaited<ReturnType<typeof changePassword>>,
    TError,
    { data: BodyType<ChangePasswordBody> },
    TContext
  >;
  request?: SecondParameter<typeof customFetch>;
}): UseMutationOptions<
  Awaited<ReturnType<typeof changePassword>>,
  TError,
  { data: BodyType<ChangePasswordBody> },
  TContext
> => {
  const mutationKey = ["changePassword"];
  const { mutation: mutationOptions, request: requestOptions } = options
    ? options.mutation &&
      "mutationKey" in options.mutation &&
      options.mutation.mutationKey
      ? options
      : { ...options, mutation: { ...options.mutation, mutationKey } }
    : { mutation: { mutationKey }, request: undefined };

  const mutationFn: MutationFunction<
    Awaited<ReturnType<typeof changePassword>>,
    { data: BodyType<ChangePasswordBody> }
  > = (props) => {
    const { data } = props ?? {};

    return changePassword(data, requestOptions);
  };

  return { mutationFn, ...mutationOptions };
};

export type ChangePasswordMutationResult = NonNullable<
  Awaited<ReturnType<typeof changePassword>>
>;
export type ChangePasswordMutationBody = BodyType<ChangePasswordBody>;
export type ChangePasswordMutationError = ErrorType<unknown>;

/**
 * @summary Change password
 */
export const useChangePassword = <
  TError = ErrorType<unknown>,
  TContext = unknown,
>(options?: {
  mutation?: UseMutationOptions<
    Awaited<ReturnType<typeof changePassword>>,
    TError,
    { data: BodyType<ChangePasswordBody> },
    TContext
  >;
  request?: SecondParameter<typeof customFetch>;
}): UseMutationResult<
  Awaited<ReturnType<typeof changePassword>>,
  TError,
  { data: BodyType<ChangePasswordBody> },
  TContext
> => {
  return useMutation(getChangePasswordMutationOptions(options));
};

/**
 * @summary Create a new meeting
 */
export const getCreateMeetingUrl = () => {
  return `/api/v1/meetings`;
};

export const createMeeting = async (
  createMeetingBody: CreateMeetingBody,
  options?: RequestInit,
): Promise<Meeting> => {
  return customFetch<Meeting>(getCreateMeetingUrl(), {
    ...options,
    method: "POST",
    headers: { "Content-Type": "application/json", ...options?.headers },
    body: JSON.stringify(createMeetingBody),
  });
};

export const getCreateMeetingMutationOptions = <
  TError = ErrorType<unknown>,
  TContext = unknown,
>(options?: {
  mutation?: UseMutationOptions<
    Awaited<ReturnType<typeof createMeeting>>,
    TError,
    { data: BodyType<CreateMeetingBody> },
    TContext
  >;
  request?: SecondParameter<typeof customFetch>;
}): UseMutationOptions<
  Awaited<ReturnType<typeof createMeeting>>,
  TError,
  { data: BodyType<CreateMeetingBody> },
  TContext
> => {
  const mutationKey = ["createMeeting"];
  const { mutation: mutationOptions, request: requestOptions } = options
    ? options.mutation &&
      "mutationKey" in options.mutation &&
      options.mutation.mutationKey
      ? options
      : { ...options, mutation: { ...options.mutation, mutationKey } }
    : { mutation: { mutationKey }, request: undefined };

  const mutationFn: MutationFunction<
    Awaited<ReturnType<typeof createMeeting>>,
    { data: BodyType<CreateMeetingBody> }
  > = (props) => {
    const { data } = props ?? {};

    return createMeeting(data, requestOptions);
  };

  return { mutationFn, ...mutationOptions };
};

export type CreateMeetingMutationResult = NonNullable<
  Awaited<ReturnType<typeof createMeeting>>
>;
export type CreateMeetingMutationBody = BodyType<CreateMeetingBody>;
export type CreateMeetingMutationError = ErrorType<unknown>;

/**
 * @summary Create a new meeting
 */
export const useCreateMeeting = <
  TError = ErrorType<unknown>,
  TContext = unknown,
>(options?: {
  mutation?: UseMutationOptions<
    Awaited<ReturnType<typeof createMeeting>>,
    TError,
    { data: BodyType<CreateMeetingBody> },
    TContext
  >;
  request?: SecondParameter<typeof customFetch>;
}): UseMutationResult<
  Awaited<ReturnType<typeof createMeeting>>,
  TError,
  { data: BodyType<CreateMeetingBody> },
  TContext
> => {
  return useMutation(getCreateMeetingMutationOptions(options));
};

/**
 * @summary Get meeting history
 */
export const getGetMeetingHistoryUrl = (params?: GetMeetingHistoryParams) => {
  const normalizedParams = new URLSearchParams();

  Object.entries(params || {}).forEach(([key, value]) => {
    if (value !== undefined) {
      normalizedParams.append(key, value === null ? "null" : value.toString());
    }
  });

  const stringifiedParams = normalizedParams.toString();

  return stringifiedParams.length > 0
    ? `/api/v1/meetings/history?${stringifiedParams}`
    : `/api/v1/meetings/history`;
};

export const getMeetingHistory = async (
  params?: GetMeetingHistoryParams,
  options?: RequestInit,
): Promise<MeetingListResponse> => {
  return customFetch<MeetingListResponse>(getGetMeetingHistoryUrl(params), {
    ...options,
    method: "GET",
  });
};

export const getGetMeetingHistoryQueryKey = (
  params?: GetMeetingHistoryParams,
) => {
  return [`/api/v1/meetings/history`, ...(params ? [params] : [])] as const;
};

export const getGetMeetingHistoryQueryOptions = <
  TData = Awaited<ReturnType<typeof getMeetingHistory>>,
  TError = ErrorType<unknown>,
>(
  params?: GetMeetingHistoryParams,
  options?: {
    query?: UseQueryOptions<
      Awaited<ReturnType<typeof getMeetingHistory>>,
      TError,
      TData
    >;
    request?: SecondParameter<typeof customFetch>;
  },
) => {
  const { query: queryOptions, request: requestOptions } = options ?? {};

  const queryKey =
    queryOptions?.queryKey ?? getGetMeetingHistoryQueryKey(params);

  const queryFn: QueryFunction<
    Awaited<ReturnType<typeof getMeetingHistory>>
  > = ({ signal }) => getMeetingHistory(params, { signal, ...requestOptions });

  return { queryKey, queryFn, ...queryOptions } as UseQueryOptions<
    Awaited<ReturnType<typeof getMeetingHistory>>,
    TError,
    TData
  > & { queryKey: QueryKey };
};

export type GetMeetingHistoryQueryResult = NonNullable<
  Awaited<ReturnType<typeof getMeetingHistory>>
>;
export type GetMeetingHistoryQueryError = ErrorType<unknown>;

/**
 * @summary Get meeting history
 */

export function useGetMeetingHistory<
  TData = Awaited<ReturnType<typeof getMeetingHistory>>,
  TError = ErrorType<unknown>,
>(
  params?: GetMeetingHistoryParams,
  options?: {
    query?: UseQueryOptions<
      Awaited<ReturnType<typeof getMeetingHistory>>,
      TError,
      TData
    >;
    request?: SecondParameter<typeof customFetch>;
  },
): UseQueryResult<TData, TError> & { queryKey: QueryKey } {
  const queryOptions = getGetMeetingHistoryQueryOptions(params, options);

  const query = useQuery(queryOptions) as UseQueryResult<TData, TError> & {
    queryKey: QueryKey;
  };

  return { ...query, queryKey: queryOptions.queryKey };
}

/**
 * @summary Get meeting by roomId
 */
export const getGetMeetingUrl = (roomId: string) => {
  return `/api/v1/meetings/${roomId}`;
};

export const getMeeting = async (
  roomId: string,
  options?: RequestInit,
): Promise<Meeting> => {
  return customFetch<Meeting>(getGetMeetingUrl(roomId), {
    ...options,
    method: "GET",
  });
};

export const getGetMeetingQueryKey = (roomId: string) => {
  return [`/api/v1/meetings/${roomId}`] as const;
};

export const getGetMeetingQueryOptions = <
  TData = Awaited<ReturnType<typeof getMeeting>>,
  TError = ErrorType<ErrorResponse>,
>(
  roomId: string,
  options?: {
    query?: UseQueryOptions<
      Awaited<ReturnType<typeof getMeeting>>,
      TError,
      TData
    >;
    request?: SecondParameter<typeof customFetch>;
  },
) => {
  const { query: queryOptions, request: requestOptions } = options ?? {};

  const queryKey = queryOptions?.queryKey ?? getGetMeetingQueryKey(roomId);

  const queryFn: QueryFunction<Awaited<ReturnType<typeof getMeeting>>> = ({
    signal,
  }) => getMeeting(roomId, { signal, ...requestOptions });

  return {
    queryKey,
    queryFn,
    enabled: !!roomId,
    ...queryOptions,
  } as UseQueryOptions<
    Awaited<ReturnType<typeof getMeeting>>,
    TError,
    TData
  > & { queryKey: QueryKey };
};

export type GetMeetingQueryResult = NonNullable<
  Awaited<ReturnType<typeof getMeeting>>
>;
export type GetMeetingQueryError = ErrorType<ErrorResponse>;

/**
 * @summary Get meeting by roomId
 */

export function useGetMeeting<
  TData = Awaited<ReturnType<typeof getMeeting>>,
  TError = ErrorType<ErrorResponse>,
>(
  roomId: string,
  options?: {
    query?: UseQueryOptions<
      Awaited<ReturnType<typeof getMeeting>>,
      TError,
      TData
    >;
    request?: SecondParameter<typeof customFetch>;
  },
): UseQueryResult<TData, TError> & { queryKey: QueryKey } {
  const queryOptions = getGetMeetingQueryOptions(roomId, options);

  const query = useQuery(queryOptions) as UseQueryResult<TData, TError> & {
    queryKey: QueryKey;
  };

  return { ...query, queryKey: queryOptions.queryKey };
}

/**
 * @summary Update meeting
 */
export const getUpdateMeetingUrl = (roomId: string) => {
  return `/api/v1/meetings/${roomId}`;
};

export const updateMeeting = async (
  roomId: string,
  updateMeetingBody: UpdateMeetingBody,
  options?: RequestInit,
): Promise<Meeting> => {
  return customFetch<Meeting>(getUpdateMeetingUrl(roomId), {
    ...options,
    method: "PATCH",
    headers: { "Content-Type": "application/json", ...options?.headers },
    body: JSON.stringify(updateMeetingBody),
  });
};

export const getUpdateMeetingMutationOptions = <
  TError = ErrorType<unknown>,
  TContext = unknown,
>(options?: {
  mutation?: UseMutationOptions<
    Awaited<ReturnType<typeof updateMeeting>>,
    TError,
    { roomId: string; data: BodyType<UpdateMeetingBody> },
    TContext
  >;
  request?: SecondParameter<typeof customFetch>;
}): UseMutationOptions<
  Awaited<ReturnType<typeof updateMeeting>>,
  TError,
  { roomId: string; data: BodyType<UpdateMeetingBody> },
  TContext
> => {
  const mutationKey = ["updateMeeting"];
  const { mutation: mutationOptions, request: requestOptions } = options
    ? options.mutation &&
      "mutationKey" in options.mutation &&
      options.mutation.mutationKey
      ? options
      : { ...options, mutation: { ...options.mutation, mutationKey } }
    : { mutation: { mutationKey }, request: undefined };

  const mutationFn: MutationFunction<
    Awaited<ReturnType<typeof updateMeeting>>,
    { roomId: string; data: BodyType<UpdateMeetingBody> }
  > = (props) => {
    const { roomId, data } = props ?? {};

    return updateMeeting(roomId, data, requestOptions);
  };

  return { mutationFn, ...mutationOptions };
};

export type UpdateMeetingMutationResult = NonNullable<
  Awaited<ReturnType<typeof updateMeeting>>
>;
export type UpdateMeetingMutationBody = BodyType<UpdateMeetingBody>;
export type UpdateMeetingMutationError = ErrorType<unknown>;

/**
 * @summary Update meeting
 */
export const useUpdateMeeting = <
  TError = ErrorType<unknown>,
  TContext = unknown,
>(options?: {
  mutation?: UseMutationOptions<
    Awaited<ReturnType<typeof updateMeeting>>,
    TError,
    { roomId: string; data: BodyType<UpdateMeetingBody> },
    TContext
  >;
  request?: SecondParameter<typeof customFetch>;
}): UseMutationResult<
  Awaited<ReturnType<typeof updateMeeting>>,
  TError,
  { roomId: string; data: BodyType<UpdateMeetingBody> },
  TContext
> => {
  return useMutation(getUpdateMeetingMutationOptions(options));
};

/**
 * @summary Delete meeting
 */
export const getDeleteMeetingUrl = (roomId: string) => {
  return `/api/v1/meetings/${roomId}`;
};

export const deleteMeeting = async (
  roomId: string,
  options?: RequestInit,
): Promise<void> => {
  return customFetch<void>(getDeleteMeetingUrl(roomId), {
    ...options,
    method: "DELETE",
  });
};

export const getDeleteMeetingMutationOptions = <
  TError = ErrorType<unknown>,
  TContext = unknown,
>(options?: {
  mutation?: UseMutationOptions<
    Awaited<ReturnType<typeof deleteMeeting>>,
    TError,
    { roomId: string },
    TContext
  >;
  request?: SecondParameter<typeof customFetch>;
}): UseMutationOptions<
  Awaited<ReturnType<typeof deleteMeeting>>,
  TError,
  { roomId: string },
  TContext
> => {
  const mutationKey = ["deleteMeeting"];
  const { mutation: mutationOptions, request: requestOptions } = options
    ? options.mutation &&
      "mutationKey" in options.mutation &&
      options.mutation.mutationKey
      ? options
      : { ...options, mutation: { ...options.mutation, mutationKey } }
    : { mutation: { mutationKey }, request: undefined };

  const mutationFn: MutationFunction<
    Awaited<ReturnType<typeof deleteMeeting>>,
    { roomId: string }
  > = (props) => {
    const { roomId } = props ?? {};

    return deleteMeeting(roomId, requestOptions);
  };

  return { mutationFn, ...mutationOptions };
};

export type DeleteMeetingMutationResult = NonNullable<
  Awaited<ReturnType<typeof deleteMeeting>>
>;

export type DeleteMeetingMutationError = ErrorType<unknown>;

/**
 * @summary Delete meeting
 */
export const useDeleteMeeting = <
  TError = ErrorType<unknown>,
  TContext = unknown,
>(options?: {
  mutation?: UseMutationOptions<
    Awaited<ReturnType<typeof deleteMeeting>>,
    TError,
    { roomId: string },
    TContext
  >;
  request?: SecondParameter<typeof customFetch>;
}): UseMutationResult<
  Awaited<ReturnType<typeof deleteMeeting>>,
  TError,
  { roomId: string },
  TContext
> => {
  return useMutation(getDeleteMeetingMutationOptions(options));
};

/**
 * @summary Verify meeting passcode
 */
export const getVerifyMeetingPasscodeUrl = (roomId: string) => {
  return `/api/v1/meetings/${roomId}/verify-passcode`;
};

export const verifyMeetingPasscode = async (
  roomId: string,
  verifyPasscodeBody: VerifyPasscodeBody,
  options?: RequestInit,
): Promise<SuccessResponse> => {
  return customFetch<SuccessResponse>(getVerifyMeetingPasscodeUrl(roomId), {
    ...options,
    method: "POST",
    headers: { "Content-Type": "application/json", ...options?.headers },
    body: JSON.stringify(verifyPasscodeBody),
  });
};

export const getVerifyMeetingPasscodeMutationOptions = <
  TError = ErrorType<ErrorResponse>,
  TContext = unknown,
>(options?: {
  mutation?: UseMutationOptions<
    Awaited<ReturnType<typeof verifyMeetingPasscode>>,
    TError,
    { roomId: string; data: BodyType<VerifyPasscodeBody> },
    TContext
  >;
  request?: SecondParameter<typeof customFetch>;
}): UseMutationOptions<
  Awaited<ReturnType<typeof verifyMeetingPasscode>>,
  TError,
  { roomId: string; data: BodyType<VerifyPasscodeBody> },
  TContext
> => {
  const mutationKey = ["verifyMeetingPasscode"];
  const { mutation: mutationOptions, request: requestOptions } = options
    ? options.mutation &&
      "mutationKey" in options.mutation &&
      options.mutation.mutationKey
      ? options
      : { ...options, mutation: { ...options.mutation, mutationKey } }
    : { mutation: { mutationKey }, request: undefined };

  const mutationFn: MutationFunction<
    Awaited<ReturnType<typeof verifyMeetingPasscode>>,
    { roomId: string; data: BodyType<VerifyPasscodeBody> }
  > = (props) => {
    const { roomId, data } = props ?? {};

    return verifyMeetingPasscode(roomId, data, requestOptions);
  };

  return { mutationFn, ...mutationOptions };
};

export type VerifyMeetingPasscodeMutationResult = NonNullable<
  Awaited<ReturnType<typeof verifyMeetingPasscode>>
>;
export type VerifyMeetingPasscodeMutationBody = BodyType<VerifyPasscodeBody>;
export type VerifyMeetingPasscodeMutationError = ErrorType<ErrorResponse>;

/**
 * @summary Verify meeting passcode
 */
export const useVerifyMeetingPasscode = <
  TError = ErrorType<ErrorResponse>,
  TContext = unknown,
>(options?: {
  mutation?: UseMutationOptions<
    Awaited<ReturnType<typeof verifyMeetingPasscode>>,
    TError,
    { roomId: string; data: BodyType<VerifyPasscodeBody> },
    TContext
  >;
  request?: SecondParameter<typeof customFetch>;
}): UseMutationResult<
  Awaited<ReturnType<typeof verifyMeetingPasscode>>,
  TError,
  { roomId: string; data: BodyType<VerifyPasscodeBody> },
  TContext
> => {
  return useMutation(getVerifyMeetingPasscodeMutationOptions(options));
};

/**
 * @summary Get meeting chat messages
 */
export const getGetMeetingMessagesUrl = (
  roomId: string,
  params?: GetMeetingMessagesParams,
) => {
  const normalizedParams = new URLSearchParams();

  Object.entries(params || {}).forEach(([key, value]) => {
    if (value !== undefined) {
      normalizedParams.append(key, value === null ? "null" : value.toString());
    }
  });

  const stringifiedParams = normalizedParams.toString();

  return stringifiedParams.length > 0
    ? `/api/v1/meetings/${roomId}/messages?${stringifiedParams}`
    : `/api/v1/meetings/${roomId}/messages`;
};

export const getMeetingMessages = async (
  roomId: string,
  params?: GetMeetingMessagesParams,
  options?: RequestInit,
): Promise<Message[]> => {
  return customFetch<Message[]>(getGetMeetingMessagesUrl(roomId, params), {
    ...options,
    method: "GET",
  });
};

export const getGetMeetingMessagesQueryKey = (
  roomId: string,
  params?: GetMeetingMessagesParams,
) => {
  return [
    `/api/v1/meetings/${roomId}/messages`,
    ...(params ? [params] : []),
  ] as const;
};

export const getGetMeetingMessagesQueryOptions = <
  TData = Awaited<ReturnType<typeof getMeetingMessages>>,
  TError = ErrorType<unknown>,
>(
  roomId: string,
  params?: GetMeetingMessagesParams,
  options?: {
    query?: UseQueryOptions<
      Awaited<ReturnType<typeof getMeetingMessages>>,
      TError,
      TData
    >;
    request?: SecondParameter<typeof customFetch>;
  },
) => {
  const { query: queryOptions, request: requestOptions } = options ?? {};

  const queryKey =
    queryOptions?.queryKey ?? getGetMeetingMessagesQueryKey(roomId, params);

  const queryFn: QueryFunction<
    Awaited<ReturnType<typeof getMeetingMessages>>
  > = ({ signal }) =>
    getMeetingMessages(roomId, params, { signal, ...requestOptions });

  return {
    queryKey,
    queryFn,
    enabled: !!roomId,
    ...queryOptions,
  } as UseQueryOptions<
    Awaited<ReturnType<typeof getMeetingMessages>>,
    TError,
    TData
  > & { queryKey: QueryKey };
};

export type GetMeetingMessagesQueryResult = NonNullable<
  Awaited<ReturnType<typeof getMeetingMessages>>
>;
export type GetMeetingMessagesQueryError = ErrorType<unknown>;

/**
 * @summary Get meeting chat messages
 */

export function useGetMeetingMessages<
  TData = Awaited<ReturnType<typeof getMeetingMessages>>,
  TError = ErrorType<unknown>,
>(
  roomId: string,
  params?: GetMeetingMessagesParams,
  options?: {
    query?: UseQueryOptions<
      Awaited<ReturnType<typeof getMeetingMessages>>,
      TError,
      TData
    >;
    request?: SecondParameter<typeof customFetch>;
  },
): UseQueryResult<TData, TError> & { queryKey: QueryKey } {
  const queryOptions = getGetMeetingMessagesQueryOptions(
    roomId,
    params,
    options,
  );

  const query = useQuery(queryOptions) as UseQueryResult<TData, TError> & {
    queryKey: QueryKey;
  };

  return { ...query, queryKey: queryOptions.queryKey };
}

/**
 * @summary Schedule a meeting
 */
export const getCreateScheduleUrl = () => {
  return `/api/v1/schedules`;
};

export const createSchedule = async (
  createScheduleBody: CreateScheduleBody,
  options?: RequestInit,
): Promise<Schedule> => {
  return customFetch<Schedule>(getCreateScheduleUrl(), {
    ...options,
    method: "POST",
    headers: { "Content-Type": "application/json", ...options?.headers },
    body: JSON.stringify(createScheduleBody),
  });
};

export const getCreateScheduleMutationOptions = <
  TError = ErrorType<unknown>,
  TContext = unknown,
>(options?: {
  mutation?: UseMutationOptions<
    Awaited<ReturnType<typeof createSchedule>>,
    TError,
    { data: BodyType<CreateScheduleBody> },
    TContext
  >;
  request?: SecondParameter<typeof customFetch>;
}): UseMutationOptions<
  Awaited<ReturnType<typeof createSchedule>>,
  TError,
  { data: BodyType<CreateScheduleBody> },
  TContext
> => {
  const mutationKey = ["createSchedule"];
  const { mutation: mutationOptions, request: requestOptions } = options
    ? options.mutation &&
      "mutationKey" in options.mutation &&
      options.mutation.mutationKey
      ? options
      : { ...options, mutation: { ...options.mutation, mutationKey } }
    : { mutation: { mutationKey }, request: undefined };

  const mutationFn: MutationFunction<
    Awaited<ReturnType<typeof createSchedule>>,
    { data: BodyType<CreateScheduleBody> }
  > = (props) => {
    const { data } = props ?? {};

    return createSchedule(data, requestOptions);
  };

  return { mutationFn, ...mutationOptions };
};

export type CreateScheduleMutationResult = NonNullable<
  Awaited<ReturnType<typeof createSchedule>>
>;
export type CreateScheduleMutationBody = BodyType<CreateScheduleBody>;
export type CreateScheduleMutationError = ErrorType<unknown>;

/**
 * @summary Schedule a meeting
 */
export const useCreateSchedule = <
  TError = ErrorType<unknown>,
  TContext = unknown,
>(options?: {
  mutation?: UseMutationOptions<
    Awaited<ReturnType<typeof createSchedule>>,
    TError,
    { data: BodyType<CreateScheduleBody> },
    TContext
  >;
  request?: SecondParameter<typeof customFetch>;
}): UseMutationResult<
  Awaited<ReturnType<typeof createSchedule>>,
  TError,
  { data: BodyType<CreateScheduleBody> },
  TContext
> => {
  return useMutation(getCreateScheduleMutationOptions(options));
};

/**
 * @summary Get schedules
 */
export const getGetSchedulesUrl = (params?: GetSchedulesParams) => {
  const normalizedParams = new URLSearchParams();

  Object.entries(params || {}).forEach(([key, value]) => {
    if (value !== undefined) {
      normalizedParams.append(key, value === null ? "null" : value.toString());
    }
  });

  const stringifiedParams = normalizedParams.toString();

  return stringifiedParams.length > 0
    ? `/api/v1/schedules?${stringifiedParams}`
    : `/api/v1/schedules`;
};

export const getSchedules = async (
  params?: GetSchedulesParams,
  options?: RequestInit,
): Promise<Schedule[]> => {
  return customFetch<Schedule[]>(getGetSchedulesUrl(params), {
    ...options,
    method: "GET",
  });
};

export const getGetSchedulesQueryKey = (params?: GetSchedulesParams) => {
  return [`/api/v1/schedules`, ...(params ? [params] : [])] as const;
};

export const getGetSchedulesQueryOptions = <
  TData = Awaited<ReturnType<typeof getSchedules>>,
  TError = ErrorType<unknown>,
>(
  params?: GetSchedulesParams,
  options?: {
    query?: UseQueryOptions<
      Awaited<ReturnType<typeof getSchedules>>,
      TError,
      TData
    >;
    request?: SecondParameter<typeof customFetch>;
  },
) => {
  const { query: queryOptions, request: requestOptions } = options ?? {};

  const queryKey = queryOptions?.queryKey ?? getGetSchedulesQueryKey(params);

  const queryFn: QueryFunction<Awaited<ReturnType<typeof getSchedules>>> = ({
    signal,
  }) => getSchedules(params, { signal, ...requestOptions });

  return { queryKey, queryFn, ...queryOptions } as UseQueryOptions<
    Awaited<ReturnType<typeof getSchedules>>,
    TError,
    TData
  > & { queryKey: QueryKey };
};

export type GetSchedulesQueryResult = NonNullable<
  Awaited<ReturnType<typeof getSchedules>>
>;
export type GetSchedulesQueryError = ErrorType<unknown>;

/**
 * @summary Get schedules
 */

export function useGetSchedules<
  TData = Awaited<ReturnType<typeof getSchedules>>,
  TError = ErrorType<unknown>,
>(
  params?: GetSchedulesParams,
  options?: {
    query?: UseQueryOptions<
      Awaited<ReturnType<typeof getSchedules>>,
      TError,
      TData
    >;
    request?: SecondParameter<typeof customFetch>;
  },
): UseQueryResult<TData, TError> & { queryKey: QueryKey } {
  const queryOptions = getGetSchedulesQueryOptions(params, options);

  const query = useQuery(queryOptions) as UseQueryResult<TData, TError> & {
    queryKey: QueryKey;
  };

  return { ...query, queryKey: queryOptions.queryKey };
}

/**
 * @summary Get schedule by id
 */
export const getGetScheduleUrl = (id: number) => {
  return `/api/v1/schedules/${id}`;
};

export const getSchedule = async (
  id: number,
  options?: RequestInit,
): Promise<Schedule> => {
  return customFetch<Schedule>(getGetScheduleUrl(id), {
    ...options,
    method: "GET",
  });
};

export const getGetScheduleQueryKey = (id: number) => {
  return [`/api/v1/schedules/${id}`] as const;
};

export const getGetScheduleQueryOptions = <
  TData = Awaited<ReturnType<typeof getSchedule>>,
  TError = ErrorType<ErrorResponse>,
>(
  id: number,
  options?: {
    query?: UseQueryOptions<
      Awaited<ReturnType<typeof getSchedule>>,
      TError,
      TData
    >;
    request?: SecondParameter<typeof customFetch>;
  },
) => {
  const { query: queryOptions, request: requestOptions } = options ?? {};

  const queryKey = queryOptions?.queryKey ?? getGetScheduleQueryKey(id);

  const queryFn: QueryFunction<Awaited<ReturnType<typeof getSchedule>>> = ({
    signal,
  }) => getSchedule(id, { signal, ...requestOptions });

  return {
    queryKey,
    queryFn,
    enabled: !!id,
    ...queryOptions,
  } as UseQueryOptions<
    Awaited<ReturnType<typeof getSchedule>>,
    TError,
    TData
  > & { queryKey: QueryKey };
};

export type GetScheduleQueryResult = NonNullable<
  Awaited<ReturnType<typeof getSchedule>>
>;
export type GetScheduleQueryError = ErrorType<ErrorResponse>;

/**
 * @summary Get schedule by id
 */

export function useGetSchedule<
  TData = Awaited<ReturnType<typeof getSchedule>>,
  TError = ErrorType<ErrorResponse>,
>(
  id: number,
  options?: {
    query?: UseQueryOptions<
      Awaited<ReturnType<typeof getSchedule>>,
      TError,
      TData
    >;
    request?: SecondParameter<typeof customFetch>;
  },
): UseQueryResult<TData, TError> & { queryKey: QueryKey } {
  const queryOptions = getGetScheduleQueryOptions(id, options);

  const query = useQuery(queryOptions) as UseQueryResult<TData, TError> & {
    queryKey: QueryKey;
  };

  return { ...query, queryKey: queryOptions.queryKey };
}

/**
 * @summary Update schedule
 */
export const getUpdateScheduleUrl = (id: number) => {
  return `/api/v1/schedules/${id}`;
};

export const updateSchedule = async (
  id: number,
  updateScheduleBody: UpdateScheduleBody,
  options?: RequestInit,
): Promise<Schedule> => {
  return customFetch<Schedule>(getUpdateScheduleUrl(id), {
    ...options,
    method: "PATCH",
    headers: { "Content-Type": "application/json", ...options?.headers },
    body: JSON.stringify(updateScheduleBody),
  });
};

export const getUpdateScheduleMutationOptions = <
  TError = ErrorType<unknown>,
  TContext = unknown,
>(options?: {
  mutation?: UseMutationOptions<
    Awaited<ReturnType<typeof updateSchedule>>,
    TError,
    { id: number; data: BodyType<UpdateScheduleBody> },
    TContext
  >;
  request?: SecondParameter<typeof customFetch>;
}): UseMutationOptions<
  Awaited<ReturnType<typeof updateSchedule>>,
  TError,
  { id: number; data: BodyType<UpdateScheduleBody> },
  TContext
> => {
  const mutationKey = ["updateSchedule"];
  const { mutation: mutationOptions, request: requestOptions } = options
    ? options.mutation &&
      "mutationKey" in options.mutation &&
      options.mutation.mutationKey
      ? options
      : { ...options, mutation: { ...options.mutation, mutationKey } }
    : { mutation: { mutationKey }, request: undefined };

  const mutationFn: MutationFunction<
    Awaited<ReturnType<typeof updateSchedule>>,
    { id: number; data: BodyType<UpdateScheduleBody> }
  > = (props) => {
    const { id, data } = props ?? {};

    return updateSchedule(id, data, requestOptions);
  };

  return { mutationFn, ...mutationOptions };
};

export type UpdateScheduleMutationResult = NonNullable<
  Awaited<ReturnType<typeof updateSchedule>>
>;
export type UpdateScheduleMutationBody = BodyType<UpdateScheduleBody>;
export type UpdateScheduleMutationError = ErrorType<unknown>;

/**
 * @summary Update schedule
 */
export const useUpdateSchedule = <
  TError = ErrorType<unknown>,
  TContext = unknown,
>(options?: {
  mutation?: UseMutationOptions<
    Awaited<ReturnType<typeof updateSchedule>>,
    TError,
    { id: number; data: BodyType<UpdateScheduleBody> },
    TContext
  >;
  request?: SecondParameter<typeof customFetch>;
}): UseMutationResult<
  Awaited<ReturnType<typeof updateSchedule>>,
  TError,
  { id: number; data: BodyType<UpdateScheduleBody> },
  TContext
> => {
  return useMutation(getUpdateScheduleMutationOptions(options));
};

/**
 * @summary Cancel/delete a schedule
 */
export const getDeleteScheduleUrl = (id: number) => {
  return `/api/v1/schedules/${id}`;
};

export const deleteSchedule = async (
  id: number,
  options?: RequestInit,
): Promise<void> => {
  return customFetch<void>(getDeleteScheduleUrl(id), {
    ...options,
    method: "DELETE",
  });
};

export const getDeleteScheduleMutationOptions = <
  TError = ErrorType<unknown>,
  TContext = unknown,
>(options?: {
  mutation?: UseMutationOptions<
    Awaited<ReturnType<typeof deleteSchedule>>,
    TError,
    { id: number },
    TContext
  >;
  request?: SecondParameter<typeof customFetch>;
}): UseMutationOptions<
  Awaited<ReturnType<typeof deleteSchedule>>,
  TError,
  { id: number },
  TContext
> => {
  const mutationKey = ["deleteSchedule"];
  const { mutation: mutationOptions, request: requestOptions } = options
    ? options.mutation &&
      "mutationKey" in options.mutation &&
      options.mutation.mutationKey
      ? options
      : { ...options, mutation: { ...options.mutation, mutationKey } }
    : { mutation: { mutationKey }, request: undefined };

  const mutationFn: MutationFunction<
    Awaited<ReturnType<typeof deleteSchedule>>,
    { id: number }
  > = (props) => {
    const { id } = props ?? {};

    return deleteSchedule(id, requestOptions);
  };

  return { mutationFn, ...mutationOptions };
};

export type DeleteScheduleMutationResult = NonNullable<
  Awaited<ReturnType<typeof deleteSchedule>>
>;

export type DeleteScheduleMutationError = ErrorType<unknown>;

/**
 * @summary Cancel/delete a schedule
 */
export const useDeleteSchedule = <
  TError = ErrorType<unknown>,
  TContext = unknown,
>(options?: {
  mutation?: UseMutationOptions<
    Awaited<ReturnType<typeof deleteSchedule>>,
    TError,
    { id: number },
    TContext
  >;
  request?: SecondParameter<typeof customFetch>;
}): UseMutationResult<
  Awaited<ReturnType<typeof deleteSchedule>>,
  TError,
  { id: number },
  TContext
> => {
  return useMutation(getDeleteScheduleMutationOptions(options));
};

/**
 * @summary Get user analytics
 */
export const getGetUserAnalyticsUrl = (params?: GetUserAnalyticsParams) => {
  const normalizedParams = new URLSearchParams();

  Object.entries(params || {}).forEach(([key, value]) => {
    if (value !== undefined) {
      normalizedParams.append(key, value === null ? "null" : value.toString());
    }
  });

  const stringifiedParams = normalizedParams.toString();

  return stringifiedParams.length > 0
    ? `/api/v1/analytics/user?${stringifiedParams}`
    : `/api/v1/analytics/user`;
};

export const getUserAnalytics = async (
  params?: GetUserAnalyticsParams,
  options?: RequestInit,
): Promise<UserAnalytics> => {
  return customFetch<UserAnalytics>(getGetUserAnalyticsUrl(params), {
    ...options,
    method: "GET",
  });
};

export const getGetUserAnalyticsQueryKey = (
  params?: GetUserAnalyticsParams,
) => {
  return [`/api/v1/analytics/user`, ...(params ? [params] : [])] as const;
};

export const getGetUserAnalyticsQueryOptions = <
  TData = Awaited<ReturnType<typeof getUserAnalytics>>,
  TError = ErrorType<unknown>,
>(
  params?: GetUserAnalyticsParams,
  options?: {
    query?: UseQueryOptions<
      Awaited<ReturnType<typeof getUserAnalytics>>,
      TError,
      TData
    >;
    request?: SecondParameter<typeof customFetch>;
  },
) => {
  const { query: queryOptions, request: requestOptions } = options ?? {};

  const queryKey =
    queryOptions?.queryKey ?? getGetUserAnalyticsQueryKey(params);

  const queryFn: QueryFunction<
    Awaited<ReturnType<typeof getUserAnalytics>>
  > = ({ signal }) => getUserAnalytics(params, { signal, ...requestOptions });

  return { queryKey, queryFn, ...queryOptions } as UseQueryOptions<
    Awaited<ReturnType<typeof getUserAnalytics>>,
    TError,
    TData
  > & { queryKey: QueryKey };
};

export type GetUserAnalyticsQueryResult = NonNullable<
  Awaited<ReturnType<typeof getUserAnalytics>>
>;
export type GetUserAnalyticsQueryError = ErrorType<unknown>;

/**
 * @summary Get user analytics
 */

export function useGetUserAnalytics<
  TData = Awaited<ReturnType<typeof getUserAnalytics>>,
  TError = ErrorType<unknown>,
>(
  params?: GetUserAnalyticsParams,
  options?: {
    query?: UseQueryOptions<
      Awaited<ReturnType<typeof getUserAnalytics>>,
      TError,
      TData
    >;
    request?: SecondParameter<typeof customFetch>;
  },
): UseQueryResult<TData, TError> & { queryKey: QueryKey } {
  const queryOptions = getGetUserAnalyticsQueryOptions(params, options);

  const query = useQuery(queryOptions) as UseQueryResult<TData, TError> & {
    queryKey: QueryKey;
  };

  return { ...query, queryKey: queryOptions.queryKey };
}

/**
 * @summary Get quick analytics overview for dashboard
 */
export const getGetAnalyticsOverviewUrl = () => {
  return `/api/v1/analytics/overview`;
};

export const getAnalyticsOverview = async (
  options?: RequestInit,
): Promise<AnalyticsOverview> => {
  return customFetch<AnalyticsOverview>(getGetAnalyticsOverviewUrl(), {
    ...options,
    method: "GET",
  });
};

export const getGetAnalyticsOverviewQueryKey = () => {
  return [`/api/v1/analytics/overview`] as const;
};

export const getGetAnalyticsOverviewQueryOptions = <
  TData = Awaited<ReturnType<typeof getAnalyticsOverview>>,
  TError = ErrorType<unknown>,
>(options?: {
  query?: UseQueryOptions<
    Awaited<ReturnType<typeof getAnalyticsOverview>>,
    TError,
    TData
  >;
  request?: SecondParameter<typeof customFetch>;
}) => {
  const { query: queryOptions, request: requestOptions } = options ?? {};

  const queryKey = queryOptions?.queryKey ?? getGetAnalyticsOverviewQueryKey();

  const queryFn: QueryFunction<
    Awaited<ReturnType<typeof getAnalyticsOverview>>
  > = ({ signal }) => getAnalyticsOverview({ signal, ...requestOptions });

  return { queryKey, queryFn, ...queryOptions } as UseQueryOptions<
    Awaited<ReturnType<typeof getAnalyticsOverview>>,
    TError,
    TData
  > & { queryKey: QueryKey };
};

export type GetAnalyticsOverviewQueryResult = NonNullable<
  Awaited<ReturnType<typeof getAnalyticsOverview>>
>;
export type GetAnalyticsOverviewQueryError = ErrorType<unknown>;

/**
 * @summary Get quick analytics overview for dashboard
 */

export function useGetAnalyticsOverview<
  TData = Awaited<ReturnType<typeof getAnalyticsOverview>>,
  TError = ErrorType<unknown>,
>(options?: {
  query?: UseQueryOptions<
    Awaited<ReturnType<typeof getAnalyticsOverview>>,
    TError,
    TData
  >;
  request?: SecondParameter<typeof customFetch>;
}): UseQueryResult<TData, TError> & { queryKey: QueryKey } {
  const queryOptions = getGetAnalyticsOverviewQueryOptions(options);

  const query = useQuery(queryOptions) as UseQueryResult<TData, TError> & {
    queryKey: QueryKey;
  };

  return { ...query, queryKey: queryOptions.queryKey };
}
