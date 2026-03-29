"use server";

import { revalidatePath } from "next/cache";
import { cookies } from "next/headers";
import { ensureMongoConnected } from "@/lib/server/mongoose";
import { AuthSessionModel } from "@/lib/server/models/AuthSession";
import type { LogoutResponse } from "../shared/types";
import { getSessionCookieName } from "@/lib/server/session-cookie-name";
import { appendSystemLog } from "@/lib/server/system-log";
import { getLoggedInUser } from "./account.action";

export async function logOut(): Promise<LogoutResponse> {
  try {
    const COOKIE_NAME = getSessionCookieName();
    const currentUser = await getLoggedInUser();
    if (currentUser) {
      revalidatePath(`user-templates-${currentUser.$id}`);
      await appendSystemLog({
        actorId: currentUser.$id,
        actorName: currentUser.name,
        actorLabels: currentUser.labels,
        actionRaw: "auth.logout",
        action: "Logout",
        resourceType: "session",
        resourceId: "logout",
        metadata: {},
      });
    }

    await ensureMongoConnected();

    const cookieSecret = (await cookies()).get(COOKIE_NAME)?.value;
    (await cookies()).delete(COOKIE_NAME);
    if (cookieSecret) {
      await AuthSessionModel.deleteOne({ secret: cookieSecret });
    }

    return { ok: true };
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Log out failed";
    return { ok: false, error: message };
  }
}

export async function logoutSession(ids: string[]): Promise<void> {
  if (ids.length === 0) return;

  await ensureMongoConnected();
  await AuthSessionModel.deleteMany({ sessionId: { $in: ids } });
}
