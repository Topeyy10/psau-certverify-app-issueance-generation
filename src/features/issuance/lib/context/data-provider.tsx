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
import { sendCertificateEmail } from "@/aactions/certificates/send-certificate-file";
import { useUser } from "@/contexts";
import { debounce } from "@/lib/utils";
import { useToastStore } from "@/stores/toast-store";
import type { CertificateStatus } from "@/types";
import type {
  CertificateActions,
  CertificatesState,
  DownloadFormat,
} from "../types";
import { safeAction } from "../util";

// Separate contexts
const CertificatesStateContext = createContext<CertificatesState | undefined>(
  undefined,
);
const CertificatesActionsContext = createContext<
  CertificateActions | undefined
>(undefined);

export function CertificatesProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user } = useUser();
  const { hasActiveToast, start, error, stop } = useToastStore(
    useShallow((s) => ({
      hasActiveToast: s.isActive,
      start: s.start,
      error: s.stopError,
      stop: s.stopSuccess,
    })),
  );

  const [state, setState] = useState<CertificatesState>({
    data: [],
    total: 0,
    page: 1,
    pageSize: 15,
    search: "",
    status: "any",
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
      .get("/api/certificates", {
        params: {
          page: state.page,
          limit: state.pageSize,
          sortBy,
          order,
          ...(state.search ? { search: state.search } : {}),
          status: state.status,
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
    state.status,
    user,
  ]);

  // --- actions ---
  const _updateStatus = async (status: CertificateStatus, id?: string[]) => {
    if (!user) return;
    const selectedIds = id || Object.keys(state.rowSelection);
    if (selectedIds.length === 0) return;

    start("Updating certificate...");
    setState((prev) => ({ ...prev, actionLoading: true }));
    await axios
      .patch("/api/certificates/status", {
        ids: selectedIds,
        status,
        user: user.$id,
      })
      .then(async (res) => {
        const result = res.data;

        if (result.ok) {
          stop(`Updated ${result.updated} certificate(s)`);
          if (result.errorList.length > 0) {
            toast.error(
              `Failed to update ${result.errorList.length} certificate(s). See console.`,
            );
            console.error(result.errorList);
          }
          setState((prev) => ({ ...prev, rowSelection: {} }));
          await _fetchData();
        } else {
          throw new Error(result.error);
        }
      })
      .catch((err: unknown) => {
        handleBlobError(err, "Failed to update certificate status");
      })
      .finally(() => {
        setState((prev) => ({ ...prev, actionLoading: false }));
      });
  };

  const _bulkDownload = async (format: DownloadFormat) => {
    if (!user) return;

    const selectedIds = Object.keys(state.rowSelection);
    if (selectedIds.length === 0) return;

    start(`Downloading ${selectedIds.length} certificate(s)`);
    setState((prev) => ({ ...prev, actionLoading: true }));

    await axios
      .post(
        "/api/certificates/download",
        { ids: selectedIds, format },
        { responseType: "blob" },
      )
      .then((res) => {
        const partialSuccess = res.headers["x-partial-success"] === "true";
        const errorsList = res.headers["x-errors"];
        if (partialSuccess && errorsList)
          console.warn("Some certificates failed:", JSON.parse(errorsList));

        const url = window.URL.createObjectURL(res.data);
        const link = document.createElement("a");
        link.href = url;
        link.download = `certificates-${new Date().toISOString()}.zip`;
        link.click();
        window.URL.revokeObjectURL(url);

        stop(
          partialSuccess
            ? `Downloaded ${selectedIds.length} certificates (some failed)`
            : `Downloaded ${selectedIds.length} certificates`,
        );
      })
      .catch((err: unknown) => {
        handleBlobError(err, "Failed to download selected certificates");
      })
      .finally(() => {
        setState((prev) => ({ ...prev, actionLoading: false }));
      });
  };

  const _downloadSingle = async (id: string, format: DownloadFormat) => {
    if (!user) return;

    start("Downloading certificate...");
    setState((prev) => ({ ...prev, actionLoading: true }));
    await axios
      .get(`/api/certificates/${id}/download`, {
        params: { format },
        responseType: "blob",
      })
      .then((res) => {
        const contentDisposition = res.headers["content-disposition"];
        const filenameMatch = contentDisposition?.match(/filename="(.+)"/);
        const filename = filenameMatch
          ? filenameMatch[1]
          : `certificate-${id}.${format}`;

        const url = window.URL.createObjectURL(res.data);
        const link = document.createElement("a");
        link.href = url;
        link.download = filename;
        link.click();
        window.URL.revokeObjectURL(url);

        stop("Certificate downloaded");
      })
      .catch(async (err: unknown) => {
        handleBlobError(err, "Failed to download certificate");
      })
      .finally(() => {
        setState((prev) => ({ ...prev, actionLoading: false }));
      });
  };

  const _sendToHolder = async (id?: string[]) => {
    if (!user) return;

    const selectedIds = id || Object.keys(state.rowSelection);
    if (selectedIds.length === 0) return;

    // Derive certificate objects
    const selectedCertificates = state.data
      .filter((cert) => selectedIds.includes(cert.$id))
      .map((cert) => ({
        id: cert.$id,
        name: cert.recipientFullName,
        email: cert.recipientEmail,
      }));

    start("Sending certificate to recipient(s)...");
    const failedRecipients: { name: string; email: string; reason: string }[] =
      [];

    for (const cert of selectedCertificates) {
      try {
        const html = `
        <p>Dear ${cert.name},</p>
        <p>Congratulations! Attached is your official certificate.</p>
        <p>Best regards,<br/>Your PSAU CertVerify Team</p>
      `;

        const res = await sendCertificateEmail({
          recipient: cert.email,
          subject: "Your Certificate is Ready!",
          html,
          certificateId: cert.id,
        });

        if (!res.ok) {
          failedRecipients.push({
            name: cert.name,
            email: cert.email,
            reason: res.error ?? "Unknown error",
          });
        }
      } catch (err: any) {
        failedRecipients.push({
          name: cert.name,
          email: cert.email,
          reason: err?.message ?? "Unexpected failure",
        });
      }
    }

    // Handle failures
    if (failedRecipients.length > 0) {
      const failedList = failedRecipients
        .map((f) => `${f.name} (${f.email}) — ${f.reason}`)
        .join("\n");

      error(`Failed to send certificates:\n${failedList}`);
    } else {
      stop(
        selectedCertificates.length > 1
          ? "All certificates sent successfully!"
          : "Certificate sent successfully!",
      );
    }
  };

  // --- stable actions object ---
  const actions: CertificateActions = useMemo(
    () => ({
      // setters
      setPage: (page) => setState((prev) => ({ ...prev, page })),
      setPageSize: (pageSize) =>
        setState((prev) => ({ ...prev, pageSize, page: 1 })),
      setSearch: debounce((value: string) => {
        setState((prev) => ({ ...prev, search: value, page: 1 }));
      }, 400),
      setStatus: (status) => setState((prev) => ({ ...prev, status })),
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
      updateStatus: safeAction(
        _updateStatus,
        () => state.loading || state.actionLoading,
      ),
      bulkDownload: safeAction(
        _bulkDownload,
        () => state.loading || state.actionLoading,
      ),
      downloadSingle: safeAction(
        _downloadSingle,
        () => state.loading || state.actionLoading,
      ),
      sendToHolder: safeAction(
        _sendToHolder,
        () => state.loading || state.actionLoading,
      ),
    }),
    [
      state.loading,
      state.actionLoading,
      state.rowSelection,
      _fetchData,
      _bulkDownload,
      _updateStatus,
      _downloadSingle,
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
export function useCertificatesState() {
  const ctx = useContext(CertificatesStateContext);
  if (!ctx)
    throw new Error(
      "useCertificatesState must be used within CertificatesProvider",
    );
  return ctx;
}

export function useCertificatesActions() {
  const ctx = useContext(CertificatesActionsContext);
  if (!ctx)
    throw new Error(
      "useCertificatesActions must be used within CertificatesProvider",
    );
  return ctx;
}
