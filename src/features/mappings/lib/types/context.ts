import type { InputMode } from "./input";

export interface DataRow {
  id: string;
  [key: string]: string;
}

export interface Placeholder {
  key: string;
  label: string;
  mappable: boolean;
  isMeta: boolean;
  isCustom: boolean;
}

export interface PlaceholderMapping {
  placeholderKey: string;
  columns: string[];
  separator: string;
}

export interface MetaMappings {
  recipientName: string;
  recipientEmail: string;
}

export interface PreviewResult {
  url: string;
  meta: MetaMappings;
}

export type AppAction =
  | { type: "SET_MODE"; payload: InputMode }
  | { type: "SET_DATA"; payload: DataRow[] }
  | { type: "ADD_ROW"; payload: DataRow }
  | { type: "DELETE_ROW"; payload: string }
  | { type: "CLEAR_DATA" }
  | { type: "SET_ACTIVE_ROW"; payload: string | null }
  | { type: "SET_PLACEHOLDER_MAPPINGS"; payload: PlaceholderMapping[] }
  | { type: "UPDATE_PLACEHOLDER_MAPPING"; payload: PlaceholderMapping }
  | { type: "RESET_MAPPINGS" }
  | { type: "SET_LOADING"; payload: boolean }
  | { type: "SET_ERROR"; payload: string | null }
  | { type: "SET_PLACEHOLDERS"; payload: Placeholder[] };

export interface AppState {
  mode: InputMode;
  data: DataRow[];
  activeRowId: string | null;
  placeholderMappings: PlaceholderMapping[];
  loading: boolean;
  error: string | null;
  metaPlaceholders: Placeholder[];
}

interface GenerateCertificateProps {
  rowId: string | null;
  id?: string;
  multiplier?: number;
}

export interface AppContextState {
  state: AppState;
  dispatch: React.Dispatch<AppAction>;
  placeholders: readonly Placeholder[];
  generateCertificate: (
    props: GenerateCertificateProps,
  ) => Promise<PreviewResult>;
}
