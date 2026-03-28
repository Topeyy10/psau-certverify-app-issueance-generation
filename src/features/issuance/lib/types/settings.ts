import type {
  ColumnFiltersState,
  RowSelectionState,
  SortingState,
  Updater,
  VisibilityState,
} from "@tanstack/react-table";
import type { Certificate, CertificateStatus } from "@/types";

export type DownloadFormat = "pdf" | "jpg";

export interface CertificatesState {
  data: Certificate[];
  total: number;
  page: number;
  pageSize: number;
  search: string;
  status: CertificateStatus;
  sorting: SortingState;
  columnFilters: ColumnFiltersState;
  columnVisibility: VisibilityState;
  rowSelection: RowSelectionState;
  loading: boolean;
  actionLoading: boolean;
}

export interface CertificateActions {
  setPage: (page: number) => void;
  setPageSize: (pageSize: number) => void;
  setSearch: (search: string) => void;
  setStatus: (status: CertificateStatus) => void;

  // All table-driven setters accept Updater<T>setSorting: (updater: Updater<SortingState>) => void;
  setSorting: (updater: Updater<SortingState>) => void;
  setColumnFilters: (updater: Updater<ColumnFiltersState>) => void;
  setColumnVisibility: (updater: Updater<VisibilityState>) => void;
  setRowSelection: (updater: Updater<RowSelectionState>) => void;

  fetchData: () => Promise<void>;
  updateStatus: (status: CertificateStatus, id?: string[]) => Promise<void>;
  bulkDownload: (format: DownloadFormat) => Promise<void>;
  downloadSingle: (id: string, format: DownloadFormat) => Promise<void>;
  sendToHolder: (id?: string[]) => Promise<void>;
}
