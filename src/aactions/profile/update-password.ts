"use server";

import type { VoidActionResponse } from "../shared/types";
import { ensureMongoConnected } from "@/lib/server/mongoose";
import { UserModel } from "@/lib/server/models/User";
import { verifyPassword } from "@/lib/server/auth/password";
import { getLoggedInUser } from "../auth";
import { hashPassword } from "@/lib/server/auth/password";

export async function updateAccountPassword(
  currentPassword: string,
  newPassword: string,
): Promise<VoidActionResponse> {
  try {
    await ensureMongoConnected();

    const currentUser = await getLoggedInUser();
    if (!currentUser) return { ok: false, error: "No session" };

    const user = await UserModel.findOne({ userId: currentUser.$id }).lean();
    if (!user) return { ok: false, error: "No session" };

    const ok = verifyPassword(currentPassword, user.passwordHash);
    if (!ok) {
      return {
        ok: false,
        error:
          "The current password didn't verify your identity. Please check your current password",
      };
    }

    await UserModel.updateOne(
      { userId: currentUser.$id },
      { $set: { passwordHash: hashPassword(newPassword) } },
    );
    return { ok: true };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Failed to update password";
    return { ok: false, error: message };
  }
}
