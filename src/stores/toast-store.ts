"use client";

import { type ExternalToast, toast } from "sonner";
import { create } from "zustand";
import { subscribeWithSelector } from "zustand/middleware";

type ToastProps = Omit<ExternalToast, "classNames" | "className">;

type ToastCallback = (
  title?: string,
  description?: string,
  opts?: ToastProps,
) => void;

interface ToastState {
  toastID: string | number | null;
  isActive: boolean;
  start: ToastCallback;
  update: ToastCallback;
  stopSuccess: ToastCallback;
  stopError: ToastCallback;
  stopInfo: ToastCallback;
  dismiss: () => void;
}

const withBoldTitle = <T extends ToastProps>(
  opts: T,
  description?: string,
): T => {
  if (!description) return opts;
  return { ...opts, classNames: { title: "!font-bold" } };
};

export const useToastStore = create<ToastState>()(
  subscribeWithSelector((set, get) => ({
    toastID: null,
    isActive: false,

    start: (title = "Loading", description, opts = {}) => {
      const { isActive, toastID } = get();

      if (isActive && toastID) {
        toast.dismiss(toastID);
      }

      const id = toast.loading(
        title,
        withBoldTitle({ description, ...opts }, description),
      );

      set({ toastID: id, isActive: true });
    },

    update: (title, description, opts = {}) => {
      const { toastID, isActive } = get();

      if (!isActive || !toastID) return;

      toast.loading(
        title,
        withBoldTitle({ id: toastID, description, ...opts }, description),
      );
    },

    stopSuccess: (title = "Done", description, opts = {}) => {
      const { toastID, isActive } = get();

      if (!isActive || !toastID) return;

      toast.success(
        title,
        withBoldTitle({ id: toastID, description, ...opts }, description),
      );

      set({ toastID: null, isActive: false });
    },

    stopError: (title = "Error", description, opts = {}) => {
      const { toastID, isActive } = get();

      if (!isActive || !toastID) return;

      toast.error(
        title,
        withBoldTitle({ id: toastID, description, ...opts }, description),
      );

      set({ toastID: null, isActive: false });
    },

    stopInfo: (title = "Info", description, opts = {}) => {
      const { toastID, isActive } = get();

      if (!isActive || !toastID) return;

      toast.info(
        title,
        withBoldTitle({ id: toastID, description, ...opts }, description),
      );

      set({ toastID: null, isActive: false });
    },

    dismiss: () => {
      const { toastID } = get();

      if (toastID) {
        toast.dismiss(toastID);
        set({ toastID: null, isActive: false });
      }
    },
  })),
);
