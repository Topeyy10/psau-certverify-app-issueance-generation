"use server";

import type { PreferenceResponse } from "../types";
import { ensureMongoConnected } from "@/lib/server/mongoose";
import { UserModel } from "@/lib/server/models/User";
import { getLoggedInUser } from "@/aactions/auth";

// biome-ignore lint/suspicious/noExplicitAny: function accepts mixed types for user preferences
export async function updatePrefs(
  data: Record<string, any>,
): Promise<PreferenceResponse> {
  try {
    await ensureMongoConnected();

    const currentUser = await getLoggedInUser();
    if (!currentUser) throw new Error("No session");

    await UserModel.updateOne(
      { userId: currentUser.$id },
      { $set: { prefs: { ...(currentUser.prefs ?? {}), ...data } } },
    );

    return { ok: true };
  } catch (err: unknown) {
    const message =
      err instanceof Error
        ? err.message
        : "Failed to update preference settings. Please try again";

    return { ok: false, error: message };
  }
}
