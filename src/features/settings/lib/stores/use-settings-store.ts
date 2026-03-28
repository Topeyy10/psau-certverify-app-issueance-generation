"use client";

import { create } from "zustand";
import { logoutSession } from "@/aactions/auth";
import { updateProfilePhoto } from "@/aactions/avatar/upload-avatar.action";
import { updatePrefs } from "@/aactions/shared/utils/preferences";
import { updateAccounInfo } from "@/aactions/profile/update-account";
import { updateAccountEmail } from "@/aactions/profile/update-email";
import { updateAccountPassword } from "@/aactions/profile/update-password";
import { useToastStore } from "@/stores/toast-store";
import { DefaultSettingsValue } from "../default-settings";
import type { Settings, SettingsState } from "../types";

export { DefaultSettingsValue };

export const useSettingsStore = create<SettingsState>((set) => ({
  ...DefaultSettingsValue,
  isLoading: false,

  updatePreferences: async (data) => {
    set({ isLoading: true });
    const { start, stopError, stopSuccess } = useToastStore.getState();
    try {
      start("Updating Preferences");
      const res = await updatePrefs(data);
      if (!res.ok) {
        throw new Error(res.error);
      } else {
        stopSuccess("Settings updated");
        set((s) => ({
          preferences: {
            ...s.preferences,
            ...data,
          },
        }));
      }
    } catch (err: unknown) {
      const message =
        err instanceof Error
          ? err.message
          : "Something went wrong. Please try again.";
      stopError(message);
    } finally {
      set({ isLoading: false });
    }
  },

  updateSecurity: async (data, type) => {
    set({ isLoading: true });
    const { start, stopError, stopSuccess } = useToastStore.getState();

    try {
      switch (type) {
        case "sessions": {
          start("Logging out selected session(s).");
          if (!data.sessionIds || data.sessionIds.length === 0) return;

          const sessionIds = data.sessionIds;

          await logoutSession(sessionIds);

          set((state) => ({
            security: {
              ...state.security,
              sessions: state.security.sessions.filter(
                (s) => !sessionIds.includes(s.$id),
              ),
            },
          }));

          stopSuccess("Successfully logged out of selected session(s).");
          return;
        }

        default:
          throw new Error(`Unsupported update type: ${type}`);
      }
    } catch (err: unknown) {
      const message =
        err instanceof Error
          ? err.message
          : "Something went wrong. Please try again.";
      console.error(err);
      stopError(message);
    } finally {
      set({ isLoading: false });
    }
  },

  updateAccount: async (data, type) => {
    set({ isLoading: true });
    const { start, stopError, stopSuccess } = useToastStore.getState();

    try {
      switch (type) {
        case "profile": {
          const profile = data.profile;
          if (!profile) return;

          start("Updating profile info");
          const res = await updateAccounInfo(profile);
          if (!res.ok) {
            throw new Error(res.error);
          } else {
            stopSuccess("Profile info updated");
          }
          break;
        }
        case "profilePhoto": {
          const file = data.profilePhoto;
          if (!file) return;

          start("Updating profile photo");
          const res = await updateProfilePhoto(file);

          if (!res.ok) {
            throw new Error(res.error);
          } else {
            stopSuccess("Profile photo updated");
          }
          break;
        }
        case "password": {
          const pw = data.password;
          if (!pw) return;

          start("Updating password");
          const res = await updateAccountPassword(
            pw.currentPassword,
            pw.newPassword,
          );

          if (!res.ok) {
            throw new Error(res.error);
          } else {
            stopSuccess("Password updated");
          }
          break;
        }
        case "email": {
          const email = data.email;
          if (!email) return;

          start("Updating email");
          const res = await updateAccountEmail(email.email, email.password);

          if (!res.ok) {
            throw new Error(res.error);
          } else {
            stopSuccess("Email updated");
          }
          break;
        }
        default:
          throw new Error(`Unsupported update type: ${type}`);
      }
    } catch (err: unknown) {
      const message =
        err instanceof Error
          ? err.message
          : "Something went wrong. Please try again.";
      stopError(message);
      throw err;
    } finally {
      set({ isLoading: false });
    }
  },
}));
