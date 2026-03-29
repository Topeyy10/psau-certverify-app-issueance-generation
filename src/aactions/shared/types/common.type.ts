export type User = {
  $id: string;
  name: string;
  email: string;
  labels: string[];
  prefs?: Record<string, unknown>;
  emailVerification?: boolean;
  status?: boolean;
  $createdAt?: string;
  $updatedAt?: string;
} | null;

export interface DocumentShape {
  $id: string;
  $createdAt: string;
  $updatedAt: string;
  [key: string]: unknown;
}

export interface DocumentListResult<T = DocumentShape> {
  total: number;
  documents: T[];
}

export type DefaultDocument = DocumentListResult<DocumentShape>;

export type UsersList = { total: number };

export interface EnvVars {
  baseUrl: string;
  cookie: string;
}

export interface SMTPEnvVars {
  hostname: string;
  port: string;
  username: string;
  password: string;
  encryption: string;
  sender: string;
}

export interface TemplateMeta {
  date_created: string;
  date_modified: string;
  isPortrait: boolean;
  author?: string;
  size: {
    w: number;
    h: number;
    paper: string;
  };
}

export interface Template {
  id: string;
  name: string;
  preview: string;
  json: string;
  meta: TemplateMeta;
}

/** Certificate Types */
export type Ordering = "asc" | "desc";
export type Status = "-1" | "0" | "1" | "any";

export interface Certificate extends DocumentShape {
  issuer: string;
  recipientFullName: string;
  fileId: string;
  status: Status;
  recipientEmail: string;
  isDeleted: boolean;
}

/** System Logs */
export interface SystemLog extends DocumentShape {
  userId: string;
  userFullName: string;
  userRole: string;
  actionRaw: string;
  action: string;
  resourceType: string;
  resourceId: string;
  metadata: string;
  ipAddress: string;
  browser: string;
  os: string;
  device: string;
  timestamp: Date;
}

export type SystemLogs = DocumentListResult<SystemLog>;

export interface CpuState {
  coreCount: string;
  cpuSpeedMhz: number;
  usagePercent: number;
  status: string;
}

export interface MemoryState {
  totalMem: number;
  freeMem: number;
  usedMem: number;
  memoryUsagePercent: number;
  status: string;
}

export interface SystemInfoState {
  hostname: string;
  platform: string;
  architecture: string;
  release: string;
  type: string;
  userInfo: {
    uuid: number | string;
    gid: number | string;
    username: string;
    homedir: string;
    shell: string;
  };
  cpuSpeedMhz: string;
  cpuModel: string;
  cpuCores: string;
}

export interface SystemState {
  cpu: CpuState;
  memory: MemoryState;
  system: SystemInfoState;
}

export interface Users {
  $id: string;
  name: string;
  email: string;
  avatarId: any;
  role: string;
  isEmailVerified: boolean;
  isBlocked: boolean;
  $createdAt: string;
  $updatedAt: string;
}
