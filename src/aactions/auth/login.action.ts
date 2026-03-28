"use server";

import { cookies } from "next/headers";
import crypto from "crypto";
import type { LoginFormData } from "@/features/auth/schema/login-schema";
import type { LoginResponse } from "../shared/types";
import { ensureMongoConnected } from "@/lib/server/mongoose";
import { AuthSessionModel } from "@/lib/server/models/AuthSession";
import { UserModel } from "@/lib/server/models/User";
import { getSessionCookieName } from "@/lib/server/session-cookie-name";
import { verifyPassword } from "@/lib/server/auth/password";

export async function loginWithEmail(
  data: LoginFormData,
): Promise<LoginResponse> {
  try {
    const COOKIE_NAME = getSessionCookieName();
    const { email, password, rememberMe } = data;

    await ensureMongoConnected();

    const user = await UserModel.findOne({ email }).lean();
    if (!user) {
      return { ok: false, error: "Login failed" };
    }

    // Match the existing UI behavior.
    if (!user.status) {
      return { ok: false, error: "The current user has been blocked." };
    }

    const isValidPassword = verifyPassword(password, user.passwordHash);
    if (!isValidPassword) {
      return { ok: false, error: "Login failed" };
    }

    // Invalidate all previous sessions and set the new one as current.
    await AuthSessionModel.updateMany(
      { userId: user.userId, current: true },
      { $set: { current: false } },
    );

    const sessionId = crypto.randomBytes(8).toString("hex"); // 16 hex chars
    const secret = crypto.randomBytes(32).toString("hex");
    const now = Date.now();
    const expiresAt = new Date(
      now + (rememberMe ? 1000 * 60 * 60 * 24 * 30 : 1000 * 60 * 60 * 24),
    );

    await AuthSessionModel.create({
      sessionId,
      userId: user.userId,
      secret,
      current: true,
      expiresAt,
      // Note: we can't reliably infer IP/device in server actions.
      ip: undefined,
      countryName: undefined,
      clientName: undefined,
      clientVersion: undefined,
      osName: undefined,
      osVersion: undefined,
      deviceName: undefined,
    });

    // Set session cookie expiration (30 days when rememberMe is enabled)
    const cookieStore = await cookies();
    cookieStore.set(COOKIE_NAME, secret, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: rememberMe ? 60 * 60 * 24 * 30 : undefined,
    });

    return { ok: true };
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Login failed";
    return { ok: false, error: message };
  }
}
