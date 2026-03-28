"use server";

import { DefaultSettingsValue } from "@/features/settings/lib/default-settings";
import type { AuthSessionItem, Settings } from "@/features/settings/lib/types";
import { getLoggedInUser } from "../auth";
import type { SettingsResponse } from "../shared/types";
import { ensureMongoConnected } from "@/lib/server/mongoose";
import { AuthSessionModel } from "@/lib/server/models/AuthSession";

function mergePreferences(
  userPrefs: Record<string, unknown>,
  defaults: Settings["preferences"],
): Settings["preferences"] {
  return {
    theme:
      typeof userPrefs.theme === "string" ? userPrefs.theme : defaults.theme,
    fontFamily:
      typeof userPrefs.fontFamily === "string"
        ? userPrefs.fontFamily
        : defaults.fontFamily,
    autoSave:
      typeof userPrefs.autoSave === "boolean"
        ? userPrefs.autoSave
        : defaults.autoSave,
    checkerboardBackground:
      typeof userPrefs.checkerboardBackground === "boolean"
        ? userPrefs.checkerboardBackground
        : defaults.checkerboardBackground,
    autoClipToArtboard:
      typeof userPrefs.autoClipToArtboard === "boolean"
        ? userPrefs.autoClipToArtboard
        : defaults.autoClipToArtboard,
    enableDragToMove:
      typeof userPrefs.enableDragToMove === "boolean"
        ? userPrefs.enableDragToMove
        : defaults.enableDragToMove,
  };
}

export async function getUserSettings(): Promise<SettingsResponse> {
  try {
    const currentUser = await getLoggedInUser();

    if (!currentUser) {
      throw new Error("No session");
    }

    await ensureMongoConnected();

    const userPrefs = (currentUser.prefs ?? {}) as Record<string, unknown>;

    const sessions = await AuthSessionModel.find({
      userId: currentUser.$id,
      expiresAt: { $gt: new Date() },
    })
      .sort({ createdAt: -1 })
      .lean();

    const sessionRows: AuthSessionItem[] = sessions.map((s) => ({
      $id: s.sessionId,
      $createdAt: s.createdAt?.toISOString() ?? new Date(0).toISOString(),
      ip: s.ip ?? "",
      countryName: s.countryName ?? "",
      clientName: s.clientName,
      clientVersion: s.clientVersion,
      osName: s.osName,
      osVersion: s.osVersion,
      deviceName: s.deviceName,
      current: !!s.current,
    }));

    const { preferences: defaultPreferences } = DefaultSettingsValue;

    const settings: Settings = {
      preferences: mergePreferences(userPrefs, defaultPreferences),
      security: {
        sessions: [
          ...sessionRows.filter((s) => s.current),
          ...sessionRows.filter((s) => !s.current),
        ],
      },
    };

    return { ok: true, data: settings };
  } catch (err: unknown) {
    const message =
      err instanceof Error
        ? err.message
        : "Failed to fetch current user's settings";
    return { ok: false, error: message };
  }
}
