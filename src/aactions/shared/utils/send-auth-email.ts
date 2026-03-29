import sgMail from "@sendgrid/mail";
import { createSmtpTransporter } from "./smtp-transport";
import { getSMTPEnv } from "./validation";

type AuthEmailPayload = {
  to: string;
  subject: string;
  text: string;
  html: string;
};

function formatSendGridError(err: unknown): Error {
  const code =
    err && typeof err === "object" && "code" in err
      ? Number((err as { code: number }).code)
      : undefined;
  if (code === 401) {
    return new Error(
      "SendGrid rejected the API key (401). In Render: set SENDGRID_API_KEY (no extra spaces), use a key with Mail Send permission, and verify EMAIL_SENDER in SendGrid.",
    );
  }
  if (code === 403) {
    return new Error(
      "SendGrid refused the request (403). Check sender/domain authentication for EMAIL_SENDER.",
    );
  }
  if (err instanceof Error) return err;
  return new Error(String(err));
}

/**
 * Send auth-related mail (verify / reset). Prefers SendGrid HTTP API when
 * configured — Gmail SMTP often times out from cloud hosts (e.g. Render).
 */
export async function sendAuthEmail(payload: AuthEmailPayload): Promise<void> {
  const apiKey = process.env.SENDGRID_API_KEY?.trim();
  const sender = process.env.EMAIL_SENDER?.trim();

  if (apiKey && sender) {
    try {
      sgMail.setApiKey(apiKey);
      await sgMail.send({
        from: sender,
        to: payload.to,
        subject: payload.subject,
        text: payload.text,
        html: payload.html,
      });
    } catch (e) {
      throw formatSendGridError(e);
    }
    return;
  }

  const smtp = getSMTPEnv();
  const transporter = createSmtpTransporter();
  await transporter.sendMail({
    from: smtp.sender,
    to: payload.to,
    subject: payload.subject,
    text: payload.text,
    html: payload.html,
  });
}
