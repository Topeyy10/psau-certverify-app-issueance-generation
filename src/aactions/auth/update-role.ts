"use server";

import { revalidateTag } from "next/cache";
import type { VoidActionResponse } from "../shared/types";
import { withRetry } from "../shared/utils";
import { getLoggedInUser } from "./account.action";
import { UserModel } from "@/lib/server/models/User";
import { ensureMongoConnected } from "@/lib/server/mongoose";

export async function updateUserRole(
  userId: string,
  role: "admin" | "issuer" | "user",
): Promise<VoidActionResponse> {
  try {
    const currentUser = await getLoggedInUser();
    if (!currentUser) {
      throw new Error("No session");
    }

    await ensureMongoConnected();

    const user = await UserModel.findOne({ userId });
    if (!user) {
      throw new Error("User not found");
    }

    await withRetry({
      fn: async () => {
        await UserModel.updateOne({ userId }, { $set: { labels: [role] } });
      },
    });

    revalidateTag("users");
    revalidateTag(`users-${currentUser.$id}`);

    return { ok: true };
  } catch (err: unknown) {
    const message =
      err instanceof Error ? err.message : "Failed to update user role label";
    return { ok: false, error: message };
  }
}
