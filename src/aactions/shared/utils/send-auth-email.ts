import sgMail from "@sendgrid/mail";
import { createSmtpTransporter } from "./smtp-transport";
import { getSMTPEnv } from "./validation";

type AuthEmailPayload = {
  to: string;
  subject: string;
  text: string;
  html: string;
};

/**
 * Send auth-related mail (verify / reset). Prefers SendGrid HTTP API when
 * configured — Gmail SMTP often times out from cloud hosts (e.g. Render).
 */
export async function sendAuthEmail(payload: AuthEmailPayload): Promise<void> {
  const apiKey = process.env.SENDGRID_API_KEY;
  const sender = process.env.EMAIL_SENDER;

  if (apiKey && sender) {
    sgMail.setApiKey(apiKey);
    await sgMail.send({
      from: sender,
      to: payload.to,
      subject: payload.subject,
      text: payload.text,
      html: payload.html,
    });
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
