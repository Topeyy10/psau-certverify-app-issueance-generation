"use server";

import sgMail from "@sendgrid/mail";
import type { VoidActionResponse } from "../shared/types";
import { getCertificateFiles } from "./get-certificate-file";

export async function sendCertificateEmail({
  recipient,
  subject,
  html,
  certificateId,
  format = "pdf",
}: {
  recipient: string;
  subject: string;
  html: string;
  certificateId: string;
  format?: string;
}): Promise<VoidActionResponse> {
  try {
    const apiKey = process.env.SENDGRID_API_KEY;
    const sender = process.env.EMAIL_SENDER;

    if (!apiKey || !sender) {
      return { ok: false, error: "Missing SendGrid configuration" };
    }

    sgMail.setApiKey(apiKey);

    const res = await getCertificateFiles(certificateId, format);

    if (!res.ok || !res.data) {
      return { ok: false, error: res.error || "Certificate not found" };
    }

    const { fileBuffer, filename } = res.data;

    await sgMail.send({
      from: sender,
      to: recipient,
      subject,
      html,
      attachments: [
        {
          content: Buffer.from(fileBuffer).toString("base64"),
          filename,
          type: format === "pdf" ? "application/pdf" : "image/png",
          disposition: "attachment",
        },
      ],
    });

    return { ok: true };
  } catch (err: unknown) {
    const message =
      err instanceof Error ? err.message : "Failed to send email";
    return { ok: false, error: message };
  }
}
