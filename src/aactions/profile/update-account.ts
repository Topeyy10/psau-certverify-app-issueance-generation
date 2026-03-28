"use server";

import type { VoidActionResponse } from "../shared/types";
import { ensureMongoConnected } from "@/lib/server/mongoose";
import { UserModel } from "@/lib/server/models/User";
import { getLoggedInUser } from "../auth";

export async function updateAccounInfo(data: {
  fullName: string;
}): Promise<VoidActionResponse> {
  try {
    await ensureMongoConnected();
    const currentUser = await getLoggedInUser();
    if (!currentUser) return { ok: false, error: "No session" };

    await UserModel.updateOne(
      { userId: currentUser.$id },
      { $set: { name: data.fullName } },
    );
    return { ok: true };
  } catch (err: unknown) {
    const message =
      err instanceof Error ? err.message : "Failed to update account info";
    return { ok: false, error: message };
  }
}
