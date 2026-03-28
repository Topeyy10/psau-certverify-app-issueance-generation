"use server";
import { cookies } from "next/headers";
import { ensureMongoConnected } from "@/lib/server/mongoose";
import { AuthSessionModel } from "@/lib/server/models/AuthSession";
import { UserModel } from "@/lib/server/models/User";
import { getSessionCookieName } from "@/lib/server/session-cookie-name";
import { withRetry } from "../shared/utils";

export async function getLoggedInUser() {
  const COOKIE_NAME = getSessionCookieName();
  try {
    return await withRetry({
      fn: async () => {
        const cookieStore = await cookies();
        const secret = cookieStore.get(COOKIE_NAME)?.value;
        if (!secret) return null;

        await ensureMongoConnected();

        const session = await AuthSessionModel.findOne({
          secret,
          expiresAt: { $gt: new Date() },
          // The UI expects the "current" session for some flows.
          current: true,
        }).lean();

        if (!session) return null;

        const user = await UserModel.findOne({ userId: session.userId }).lean();
        if (!user) return null;

        // Shape matches UI expectations ($id, labels, prefs, …).
        return {
          $id: user.userId,
          name: user.name,
          email: user.email,
          labels: user.labels,
          prefs: user.prefs ?? {},
          emailVerification: user.emailVerification,
          status: user.status,
          $createdAt: user.createdAt?.toISOString() ?? new Date(0).toISOString(),
          $updatedAt: user.updatedAt?.toISOString() ?? new Date(0).toISOString(),
        };
      },
    });
  } catch {
    return null;
  }
}
