import nodemailer from "nodemailer";
import { getSMTPEnv } from "./validation";

const SMTP_TIMEOUT_MS = 25_000;

/** Nodemailer transport for auth emails (verify + reset). Fails fast if the host is unreachable. */
export function createSmtpTransporter() {
  const smtp = getSMTPEnv();
  const port = Number(smtp.port);
  const enc = smtp.encryption.toLowerCase().trim();
  // Port 465 = implicit TLS (SMTPS). Port 587 = STARTTLS (secure=false + requireTLS).
  const implicitTls = port === 465 || enc === "ssl" || enc === "smtps";
  const startTls =
    port === 587 || enc === "tls" || enc === "starttls" || enc === "587";
  return nodemailer.createTransport({
    host: smtp.hostname,
    port,
    secure: implicitTls,
    requireTLS: startTls && !implicitTls,
    connectionTimeout: SMTP_TIMEOUT_MS,
    greetingTimeout: SMTP_TIMEOUT_MS,
    socketTimeout: SMTP_TIMEOUT_MS,
    auth: {
      user: smtp.username,
      pass: smtp.password,
    },
  });
}
