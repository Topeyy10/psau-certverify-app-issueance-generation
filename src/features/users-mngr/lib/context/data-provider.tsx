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
import { useShallow } from "zustand/react/shallow";
import {
  sendPasswordReset,
  updateUserRole,
  updateUserStaus,
} from "@/aactions/auth";
import { useUser } from "@/contexts";
import { debounce } from "@/lib/utils";
import { useToastStore } from "@/stores/toast-store";
import type { UsersDataActions, UsersDataState } from "../types";
import { safeAction } from "../util";

// Separate contexts
const CertificatesStateContext = createContext<UsersDataState | undefined>(
  undefined,
);
const CertificatesActionsContext = createContext<UsersDataActions | undefined>(
  undefined,
);

export function DataProvider({ children }: { children: React.ReactNode }) {
  const { user } = useUser();
  const { start, error, stop } = useToastStore(
    useShallow((s) => ({
      start: s.start,
      error: s.stopError,
      stop: s.stopSuccess,
    })),
  );

  const [state, setState] = useState<UsersDataState>({
    data: [],
    total: 0,
    page: 1,
    pageSize: 15,
    search: "",
    role: "any",
    sorting: [{ id: "$createdAt", desc: true }],
    columnFilters: [],
    columnVisibility: {},
    rowSelection: {},
    loading: false,
    actionLoading: false,
  });

  // utility
  const handleBlobError = useCallback(
    async (err: unknown, defaultErr: string) => {
      let message = defaultErr;
      if (axios.isAxiosError(err) && err.response?.data) {
        if (err.response.data instanceof Blob) {
          try {
            const text = await err.response.data.text();
            const json = JSON.parse(text);
            message = json.error || message;
          } catch {}
        } else if (err.response.data.error) {
          message = err.response.data.error;
        }
      } else if (err instanceof Error) {
        message = err.message;
      }
      error(message);
    },
    [error],
  );

  /* ------------------------- PRIVATE IMPLEMENTATIONS ------------------------ */
  // --- data fetch ---
  const _fetchData = useCallback(async () => {
    if (!user) return;
    setState((prev) => ({ ...prev, loading: true }));

    const sortBy = state.sorting[0]?.id || "$createdAt";
    const order = state.sorting[0]?.desc ? "desc" : "asc";

    await axios
      .get("/api/users", {
        params: {
          page: state.page,
          limit: state.pageSize,
          sortBy,
          order,
          ...(state.search ? { search: state.search } : {}),
          role: state.role,
        },
        timeout: 10000,
      })
      .then((res) => {
        setState((prev) => ({
          ...prev,
          data: res.data.items,
          total: res.data.total,
          rowSelection: {},
        }));
      })
      .catch((err) => {
        let message = "Failed to fetch certificates";

        if (err instanceof AxiosError) {
          if (err.code === "ECONNABORTED") {
            message = "Fetch timeout. Please try again";
          } else if (err.response?.data) {
            if (typeof err.response.data === "string") {
              message = err.response.data;
            } else if (
              typeof err.response.data === "object" &&
              err.response.data.error
            ) {
              message = String(err.response.data.error);
            }
          }
        }

        toast.error(message);
      })
      .finally(() => {
        setState((prev) => ({ ...prev, loading: false }));
      });
  }, [
    state.page,
    state.pageSize,
    state.search,
    state.sorting,
    state.role,
    user,
  ]);

  // --- actions ---
  const _updateRole = async (id: string, role: "admin" | "issuer" | "user") => {
    if (!user || !id) return;

    start("Updating user role...");
    setState((prev) => ({ ...prev, actionLoading: true }));

    try {
      const res = await updateUserRole(id, role);
      if (!res.ok) {
        throw res.error;
      }

      stop("Role updated");
      await _fetchData();
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : "Failed to update user role";
      error(message);
    } finally {
      setState((prev) => ({ ...prev, actionLoading: false }));
    }
  };

  const _updateStatus = async (id: string, status: boolean) => {
    if (!id) return;

    start("Updating user status...");
    setState((prev) => ({ ...prev, actionLoading: true }));

    try {
      const res = await updateUserStaus(id, status);
      if (!res.ok) {
        throw res.error;
      }

      stop("Status updated");
      await _fetchData();
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : "Failed to update user status";
      error(message);
    } finally {
      setState((prev) => ({ ...prev, actionLoading: false }));
    }
  };

  const _resetPassword = async (email: string) => {
    if (!email) return;

    start("Sending password reset link...");
    setState((prev) => ({ ...prev, actionLoading: true }));

    try {
      const res = await sendPasswordReset(email);
      console.log(res);
      if (!res.ok) {
        throw res.error;
      }
      stop("Password reset link sent");
    } catch (err: unknown) {
      const message =
        typeof err === "string" ? err : "Failed to send password reset link";
      error(message);
    } finally {
      setState((prev) => ({ ...prev, actionLoading: false }));
    }
  };

  // --- stable actions object ---
  const actions: UsersDataActions = useMemo(
    () => ({
      // setters
      setPage: (page) => setState((prev) => ({ ...prev, page })),
      setPageSize: (pageSize) =>
        setState((prev) => ({ ...prev, pageSize, page: 1 })),
      setSearch: debounce((value: string) => {
        setState((prev) => ({ ...prev, search: value, page: 1 }));
      }, 400),
      setRole: (role) => setState((prev) => ({ ...prev, role })),
      setSorting: (updater) =>
        setState((prev) => ({
          ...prev,
          sorting:
            typeof updater === "function" ? updater(prev.sorting) : updater,
          page: 1,
        })),
      setColumnFilters: (updater) =>
        setState((prev) => ({
          ...prev,
          columnFilters:
            typeof updater === "function"
              ? updater(prev.columnFilters)
              : updater,
          page: 1,
        })),
      setColumnVisibility: (updater) =>
        setState((prev) => ({
          ...prev,
          columnVisibility:
            typeof updater === "function"
              ? updater(prev.columnVisibility)
              : updater,
        })),
      setRowSelection: (updater) => {
        return setState((prev) => ({
          ...prev,
          rowSelection:
            typeof updater === "function"
              ? updater(prev.rowSelection)
              : updater,
        }));
      },

      // safe async actions
      fetchData: safeAction(
        _fetchData,
        () => state.loading || state.actionLoading,
      ),
      updateRole: safeAction(
        _updateRole,
        () => state.loading || state.actionLoading,
      ),
      updateStatus: safeAction(
        _updateStatus,
        () => state.loading || state.actionLoading,
      ),
      resetPassword: safeAction(
        _resetPassword,
        () => state.loading || state.actionLoading,
      ),
    }),
    [
      state.loading,
      state.actionLoading,
      state.rowSelection,
      _fetchData,
      _updateRole,
    ],
  );

  // --- effects ---
  // Reset only when user changes
  useEffect(() => {
    if (!user) {
      setState((prev) => ({ ...prev, data: [], total: 0, page: 1 }));
      return;
    }
    setState((prev) => ({ ...prev, data: [], total: 0, page: 1 }));
  }, [user]);

  // Fetch when state changes
  useEffect(() => {
    if (!user) return;
    _fetchData();
  }, [user, _fetchData]);

  return (
    <CertificatesStateContext.Provider value={state}>
      <CertificatesActionsContext.Provider value={actions}>
        {children}
      </CertificatesActionsContext.Provider>
    </CertificatesStateContext.Provider>
  );
}

// Hooks
export function useUsersState() {
  const ctx = useContext(CertificatesStateContext);
  if (!ctx) throw new Error("useUsersState must be used within DataProvider");
  return ctx;
}

export function useUsersActions() {
  const ctx = useContext(CertificatesActionsContext);
  if (!ctx) throw new Error("useUsersActions must be used within DataProvider");
  return ctx;
}
