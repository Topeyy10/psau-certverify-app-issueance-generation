"use client";

import axios, { AxiosError } from "axios";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { toast } from "sonner";
import type { SystemLog } from "@/aactions/shared/types";
import { useUser } from "@/contexts";

interface LogsState {
  data: SystemLog[];
  total: number;
  page: number;
  pageSize: number;
  sorting: { id: string; desc: boolean }[];
  loading: boolean;
  lastFetch: Date | null;
}

interface LogsActions {
  setPage: (page: number) => void;
  setPageSize: (pageSize: number) => void;
  setSorting: (
    updater:
      | ((prev: LogsState["sorting"]) => LogsState["sorting"])
      | LogsState["sorting"],
  ) => void;
  fetchData: () => Promise<void>;
}

const LogsStateContext = createContext<LogsState | undefined>(undefined);
const LogsActionsContext = createContext<LogsActions | undefined>(undefined);

export function LogsProvider({ children }: { children: React.ReactNode }) {
  const { user } = useUser();

  const [state, setState] = useState<LogsState>({
    data: [],
    total: 0,
    page: 1,
    pageSize: 20,
    sorting: [{ id: "$createdAt", desc: true }],
    loading: false,
    lastFetch: null,
  });

  const fetchData = useCallback(async () => {
    if (!user) return;
    setState((prev) => ({ ...prev, loading: true }));

    const sort = state.sorting[0];
    const sortBy = sort?.id || "$createdAt";
    const order = sort?.desc ? "desc" : "asc";

    try {
      const res = await axios.get("/api/logs", {
        params: {
          page: state.page,
          limit: state.pageSize,
          sortBy,
          order,
        },
        timeout: 10000,
      });
      setState((prev) => ({
        ...prev,
        data: res.data.documents,
        total: res.data.total ?? res.data.documents.length,
        lastFetch: new Date(),
      }));
    } catch (err) {
      let message = "Failed to fetch logs";
      if (err instanceof AxiosError) {
        if (err.code === "ECONNABORTED") {
          message = "Fetch timeout. Please try again";
        } else if (err.response?.data?.error) {
          message = err.response.data.error;
        }
      }
      toast.error(message);
    } finally {
      setState((prev) => ({ ...prev, loading: false }));
    }
  }, [user, state.page, state.pageSize, state.sorting]);

  const actions: LogsActions = useMemo(
    () => ({
      setPage: (page) => setState((prev) => ({ ...prev, page })),
      setPageSize: (pageSize) =>
        setState((prev) => ({ ...prev, pageSize, page: 1 })),
      setSorting: (updater) =>
        setState((prev) => ({
          ...prev,
          sorting:
            typeof updater === "function" ? updater(prev.sorting) : updater,
          page: 1,
        })),
      fetchData,
    }),
    [fetchData],
  );

  useEffect(() => {
    if (!user) {
      setState((prev) => ({ ...prev, data: [], total: 0, page: 1 }));
      return;
    }
    fetchData();
  }, [user, fetchData]);

  return (
    <LogsStateContext.Provider value={state}>
      <LogsActionsContext.Provider value={actions}>
        {children}
      </LogsActionsContext.Provider>
    </LogsStateContext.Provider>
  );
}

export function useLogsState() {
  const ctx = useContext(LogsStateContext);
  if (!ctx) throw new Error("useLogsState must be used within LogsProvider");
  return ctx;
}

export function useLogsActions() {
  const ctx = useContext(LogsActionsContext);
  if (!ctx) throw new Error("useLogsActions must be used within LogsProvider");
  return ctx;
}
