"use server";

import type { VoidActionResponse } from "../shared/types";
import { getEnv } from "../shared/utils";
import nodemailer from "nodemailer";
import { ensureMongoConnected } from "@/lib/server/mongoose";
import { EmailVerificationTokenModel } from "@/lib/server/models/EmailVerificationToken";
import { UserModel } from "@/lib/server/models/User";
import { getSMTPEnv } from "../shared/utils/validation";
import crypto from "crypto";
import { getLoggedInUser } from "./account.action";

export async function sendVerificationEmail(): Promise<VoidActionResponse> {
  try {
    const { baseUrl: BASE_URL } = getEnv();
    const currentUser = await getLoggedInUser();
    if (!currentUser) return { ok: false, error: "No session" };

    await ensureMongoConnected();

    // Rotate token each time user requests resend.
    await EmailVerificationTokenModel.deleteMany({ userId: currentUser.$id });

    const secret = crypto.randomBytes(32).toString("hex");
    const expiresAt = new Date(Date.now() + 1000 * 60 * 60 * 24); // 24h

    await EmailVerificationTokenModel.create({
      userId: currentUser.$id,
      secret,
      expiresAt,
    });

    const smtp = getSMTPEnv();
    const transporter = nodemailer.createTransport({
      host: smtp.hostname,
      port: Number(smtp.port),
      secure: smtp.encryption.toLowerCase() === "ssl",
      auth: {
        user: smtp.username,
        pass: smtp.password,
      },
    });

    const verifyUrl = `${BASE_URL}/verify?userId=${encodeURIComponent(
      currentUser.$id,
    )}&secret=${encodeURIComponent(secret)}`;

    await transporter.sendMail({
      from: smtp.sender,
      to: currentUser.email,
      subject: "Verify your email",
      text: `Click to verify your email: ${verifyUrl}`,
      html: `<p>Click to verify your email:</p><p><a href="${verifyUrl}">${verifyUrl}</a></p>`,
    });

    return { ok: true };
  } catch (error: unknown) {
    const message =
      error instanceof Error
        ? error.message
        : "Failed to send verification email";
    return { ok: false, error: message };
  }
}

export async function verifyEmail(
  userId: string,
  secret: string,
): Promise<VoidActionResponse> {
  try {
    await ensureMongoConnected();

    const token = await EmailVerificationTokenModel.findOne({
      userId,
      secret,
      expiresAt: { $gt: new Date() },
      usedAt: { $exists: false },
    }).lean();

    if (!token) {
      return { ok: false, error: "Invalid or expired verification link." };
    }

    await UserModel.updateOne(
      { userId },
      { $set: { emailVerification: true } },
    );

    await EmailVerificationTokenModel.updateOne(
      { userId, secret },
      { $set: { usedAt: new Date() } },
    );

    return { ok: true };
  } catch (error: unknown) {
    const message =
      error instanceof Error ? error.message : "Failed to verify email";
    return { ok: false, error: message };
  }
}
