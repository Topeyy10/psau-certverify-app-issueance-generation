"use server";

import type { VoidActionResponse } from "../shared/types";
import { getEnv } from "../shared/utils";
import { ensureMongoConnected } from "@/lib/server/mongoose";
import { PasswordRecoveryTokenModel } from "@/lib/server/models/PasswordRecoveryToken";
import { UserModel } from "@/lib/server/models/User";
import { createSmtpTransporter } from "../shared/utils/smtp-transport";
import { getSMTPEnv } from "../shared/utils/validation";
import crypto from "crypto";
import { hashPassword } from "@/lib/server/auth/password";

export async function sendPasswordReset(
  email: string,
): Promise<VoidActionResponse> {
  try {
    const { baseUrl: BASE_URL } = getEnv();
    await ensureMongoConnected();

    const user = await UserModel.findOne({ email }).lean();
    if (!user) {
      // Don't leak which emails exist.
      return { ok: true };
    }

    await PasswordRecoveryTokenModel.deleteMany({ userId: user.userId });

    const secret = crypto.randomBytes(32).toString("hex");
    const expiresAt = new Date(Date.now() + 1000 * 60 * 60 * 24); // 24h

    await PasswordRecoveryTokenModel.create({
      userId: user.userId,
      secret,
      expiresAt,
    });

    const smtp = getSMTPEnv();
    const transporter = createSmtpTransporter();

    const resetUrl = `${BASE_URL}/reset?userId=${encodeURIComponent(
      user.userId,
    )}&secret=${encodeURIComponent(secret)}`;

    await transporter.sendMail({
      from: smtp.sender,
      to: email,
      subject: "Reset your password",
      text: `Click to reset your password: ${resetUrl}`,
      html: `<p>Click to reset your password:</p><p><a href="${resetUrl}">${resetUrl}</a></p>`,
    });

    return { ok: true };
  } catch (err: unknown) {
    const message =
      err instanceof Error ? err.message : "Failed to send password reset link.";
    return { ok: false, error: message };
  }
}

export async function resetUserPassword(
  userId: string,
  secret: string,
  password: string,
): Promise<VoidActionResponse> {
  try {
    await ensureMongoConnected();

    const token = await PasswordRecoveryTokenModel.findOne({
      userId,
      secret,
      expiresAt: { $gt: new Date() },
    }).lean();

    if (!token) {
      return {
        ok: false,
        error: "This recovery link has already been used or is invalid.",
      };
    }

    await UserModel.updateOne(
      { userId },
      { $set: { passwordHash: hashPassword(password) } },
    );

    // Mark used by deleting token (simple + secure enough).
    await PasswordRecoveryTokenModel.deleteOne({ userId, secret });

    return { ok: true };
  } catch (err: unknown) {
    const message =
      err instanceof Error ? err.message : "Failed to reset password.";

    return { ok: false, error: message };
  }
}
