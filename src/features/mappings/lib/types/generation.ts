import type { MetaMappings } from "./context";

export interface GenerationResult {
  id: string;
  url: string;
  meta: MetaMappings;
}

export interface StorageResult {
  certificateId: string;
  imageFileId: string;
  success: boolean;
  error?: string;
}

export interface BatchState {
  isOpen: boolean;
  isGenerating: boolean;
  progress: number;
  completed: number;
  total: number;
  failedRows: string[];
  completedCertificates: StorageResult[];
  consecutiveFailures: number;
}

export interface ProgressDialogRef {
  startUpload: () => void;
}
