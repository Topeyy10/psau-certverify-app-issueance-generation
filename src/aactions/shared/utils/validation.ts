import { getSessionCookieName } from "@/lib/server/session-cookie-name";
import type { EnvVars, SMTPEnvVars } from "../types/common.type";

export function getEnv(): EnvVars {
  const baseUrl = process.env.NEXT_PUBLIC_APP_BASE_URL;
  if (!baseUrl) {
    throw new Error("NEXT_PUBLIC_APP_BASE_URL is not defined");
  }
  return {
    baseUrl,
    cookie: getSessionCookieName(),
  };
}

export function getSMTPEnv(): SMTPEnvVars {
  const requiredVars: Record<keyof SMTPEnvVars, string> = {
    hostname: "SMTP_HOST",
    port: "SMTP_PORT",
    username: "SMTP_USERNAME",
    password: "SMTP_PASSWORD",
    encryption: "SMTP_ENCRYPTION",
    sender: "SMTP_SENDER_EMAIL",
  };

  const result = {} as SMTPEnvVars;

  for (const [key, envVar] of Object.entries(requiredVars)) {
    const value = process.env[envVar];
    if (!value) throw new Error(`${envVar} is not defined`);
    result[key as keyof SMTPEnvVars] = value;
  }

  return result;
}
