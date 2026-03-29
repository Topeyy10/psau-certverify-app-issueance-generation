import type { Settings } from "@/features/settings/lib/types";
import type {
  Certificate,
  CpuState,
  DefaultDocument,
  MemoryState,
  SystemInfoState,
  SystemLogs,
  SystemState,
  Template,
  Users,
  UsersList,
} from "./common.type";

/** Base Type */
export interface ActionResponse<T = unknown> {
  ok: boolean;
  data?: T;
  error?: string;
}

/** Common Response */
export interface SuccessResponse<T> extends ActionResponse<T> {
  ok: true;
  data: T;
}

export interface ErrorResponse extends ActionResponse<never> {
  ok: false;
  error: string;
}

export interface VoidSuccessResponse extends ActionResponse<null> {
  ok: true;
}

export type VoidActionResponse = VoidSuccessResponse | ErrorResponse;

export type DocumentResponse = ActionResponse<DefaultDocument> | ErrorResponse;

/** Action Response */
/** Authentication */
export type LoginResponse = VoidActionResponse;
export type LogoutResponse = VoidActionResponse;
export type SignupResponse = VoidActionResponse;
export type VerifyResponse = VoidActionResponse;

export type ImageResponse = SuccessResponse<string> | ErrorResponse;

/** Profile */
export type PreferenceResponse = VoidActionResponse;
export type SettingsResponse = SuccessResponse<Settings> | ErrorResponse;

/** Templates */
export interface TemplatesResponse {
  templates: Template[];
  total: number;
  page: number;
  totalPages: number;
  hasNextPage: boolean;
}
export type TemplateResponse = SuccessResponse<string> | ErrorResponse;

/** Admin stuff */

export interface HealthData {
  health: "online" | "offline";
  timestamp: Date;
  ping: number;
}
export type HealthResponse = SuccessResponse<HealthData> | ErrorResponse;

export type UsersResponse = SuccessResponse<UsersList> | ErrorResponse;

export type SystemLogsResponse = SuccessResponse<SystemLogs> | ErrorResponse;

export type CPUResponse = SuccessResponse<{ cpu: CpuState }> | ErrorResponse;
export type MemoryResponse =
  | SuccessResponse<{ memory: MemoryState }>
  | ErrorResponse;
export type SystemInfoResponse =
  | SuccessResponse<{ system: SystemInfoState }>
  | ErrorResponse;

export type SystemStateResponse = SuccessResponse<SystemState> | ErrorResponse;

export type SystemResponse =
  | CPUResponse
  | MemoryResponse
  | SystemInfoResponse
  | SystemStateResponse;

/** Certificates */
export interface CertificateData {
  items: Certificate[];
  total: number;
  page: number;
  limit: number;
}

export interface CertificateMetadata {
  recipient: string;
  filename: string;
  fileId: string;
}

export type CertificatResponse =
  | SuccessResponse<CertificateData>
  | ErrorResponse;

export interface CertificateFile {
  fileBuffer: ArrayBuffer | SharedArrayBuffer;
  filename: string;
}

export type CertificateFileResponse =
  | SuccessResponse<CertificateFile>
  | ErrorResponse;

/** Users */

export interface UserData {
  items: Users[];
  total: number;
  page: number;
  limit: number;
}

export type UserDataReponse = SuccessResponse<UserData> | ErrorResponse;
