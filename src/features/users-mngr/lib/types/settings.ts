import type {
  ColumnFiltersState,
  RowSelectionState,
  SortingState,
  Updater,
  VisibilityState,
} from "@tanstack/react-table";
import type { Users } from "@/aactions/shared/types";

export type DownloadFormat = "pdf" | "jpg";

export interface UsersDataState {
  data: Users[];
  total: number;
  page: number;
  pageSize: number;
  search: string;
  role: "any" | "admin" | "issuer" | "user";
  sorting: SortingState;
  columnFilters: ColumnFiltersState;
  columnVisibility: VisibilityState;
  rowSelection: RowSelectionState;
  loading: boolean;
  actionLoading: boolean;
}

export interface UsersDataActions {
  setPage: (page: number) => void;
  setPageSize: (pageSize: number) => void;
  setSearch: (search: string) => void;
  setRole: (status: "any" | "admin" | "issuer" | "user") => void;

  // All table-driven setters accept Updater<T>setSorting: (updater: Updater<SortingState>) => void;
  setSorting: (updater: Updater<SortingState>) => void;
  setColumnFilters: (updater: Updater<ColumnFiltersState>) => void;
  setColumnVisibility: (updater: Updater<VisibilityState>) => void;
  setRowSelection: (updater: Updater<RowSelectionState>) => void;

  fetchData: () => Promise<void>;
  updateRole: (id: string, role: "admin" | "issuer" | "user") => Promise<void>;
  updateStatus: (id: string, status: boolean) => void;
  resetPassword: (email: string) => void;
}
