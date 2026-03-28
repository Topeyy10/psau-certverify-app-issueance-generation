"use server";

import { revalidateTag } from "next/cache";
import type { VoidActionResponse } from "../shared/types";
import { withRetry } from "../shared/utils";
import { getLoggedInUser } from "./account.action";
import { AuthSessionModel } from "@/lib/server/models/AuthSession";
import { UserModel } from "@/lib/server/models/User";
import { ensureMongoConnected } from "@/lib/server/mongoose";

export async function updateUserStaus(
  userId: string,
  status: boolean,
): Promise<VoidActionResponse> {
  try {
    const currentUser = await getLoggedInUser();
    if (!currentUser) {
      throw new Error("No session");
    }

    await ensureMongoConnected();

    await withRetry({
      fn: async () => {
        await UserModel.updateOne({ userId }, { $set: { status } });
      },
    });

    if (!status) {
      await withRetry({
        fn: async () => {
          await AuthSessionModel.deleteMany({ userId });
        },
      });
    }

    revalidateTag(`users-${currentUser.$id}`);
    return { ok: true };
  } catch (err: unknown) {
    const message =
      err instanceof Error ? err.message : "Failed to update user status";
    return { ok: false, error: message };
  }
}
