"use server";

import type { VoidActionResponse } from "../shared/types";
import { ensureMongoConnected } from "@/lib/server/mongoose";
import { UserModel } from "@/lib/server/models/User";
import { verifyPassword } from "@/lib/server/auth/password";
import { getLoggedInUser } from "../auth";

export async function updateAccountEmail(
  newEmail: string,
  password: string,
): Promise<VoidActionResponse> {
  try {
    await ensureMongoConnected();

    const currentUser = await getLoggedInUser();
    if (!currentUser) return { ok: false, error: "No session" };

    const user = await UserModel.findOne({ userId: currentUser.$id }).lean();
    if (!user) return { ok: false, error: "No session" };

    const ok = verifyPassword(password, user.passwordHash);
    if (!ok) {
      return {
        ok: false,
        error:
          "The current password provided didn't verify your identity, please enter current password",
      };
    }

    await UserModel.updateOne(
      { userId: currentUser.$id },
      {
        $set: {
          email: newEmail,
          emailVerification: false,
          // Keep status/labels/prefs.
        },
      },
    );

    return { ok: true };
  } catch (err: unknown) {
    const message =
      err instanceof Error ? err.message : "Failed to update email address";
    return { ok: false, error: message };
  }
}
