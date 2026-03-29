"use server";

import type { SignupFormData } from "@/features/auth/schema/signup-schema";
import type { SignupResponse } from "../shared/types";
import { ensureMongoConnected } from "@/lib/server/mongoose";
import { UserModel, type UserRole } from "@/lib/server/models/User";
import { uniqueId } from "@/lib/server/id";
import { hashPassword } from "@/lib/server/auth/password";
import { appendSystemLog } from "@/lib/server/system-log";

function escapeRegex(s: string): string {
  return s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

export async function signupWithEmail(
  data: SignupFormData,
): Promise<SignupResponse> {
  const email = data.email.trim().toLowerCase();
  const fullName = data.fullName.trim();
  const { password } = data;
  try {
    await ensureMongoConnected();

    const existing = await UserModel.findOne({
      email: new RegExp(`^${escapeRegex(email)}$`, "i"),
    }).lean();
    if (existing) {
      return { ok: false, error: "An account with this email already exists" };
    }

    const userId = uniqueId();
    const labels: UserRole[] = ["user"];

    await UserModel.create({
      userId,
      email,
      name: fullName,
      labels,
      status: true,
      emailVerification: false,
      passwordHash: hashPassword(password),
      prefs: {},
    });

    await appendSystemLog({
      actorId: userId,
      actorName: fullName,
      actorLabels: labels,
      actionRaw: "auth.signup.success",
      action: "Sign up",
      resourceType: "user",
      resourceId: userId,
      metadata: { email },
    });

    return { ok: true };
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Sign up failed";
    return { ok: false, error: message };
  }
}
