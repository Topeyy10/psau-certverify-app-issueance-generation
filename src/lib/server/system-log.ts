import { headers } from "next/headers";
import { SystemLogModel } from "@/lib/server/models/SystemLogDoc";
import { ensureMongoConnected } from "@/lib/server/mongoose";

export type AppendSystemLogParams = {
  actorId: string;
  actorName: string;
  actorLabels?: string[];
  actionRaw: string;
  action: string;
  resourceType: string;
  resourceId: string;
  metadata?: Record<string, unknown>;
};

export function resolveUserRole(labels: string[] | undefined): string {
  if (!labels?.length) return "unknown";
  if (labels.includes("admin")) return "admin";
  if (labels.includes("issuer")) return "issuer";
  if (labels.includes("user")) return "user";
  return "unknown";
}

export function getClientIpFromHeaders(h: Headers): string {
  const xff = h.get("x-forwarded-for");
  if (xff) {
    const first = xff.split(",")[0]?.trim();
    if (first) return first;
  }
  const realIp = h.get("x-real-ip")?.trim();
  if (realIp) return realIp;
  const cf = h.get("cf-connecting-ip")?.trim();
  if (cf) return cf;
  return "unknown";
}

function sniffUserAgent(ua: string): {
  browser: string;
  os: string;
  device: string;
} {
  if (!ua) {
    return { browser: "Unknown", os: "Unknown", device: "Unknown" };
  }
  let browser = "Unknown";
  let os = "Unknown";
  const device = /Mobile|Android|iPhone|iPad/i.test(ua) ? "Mobile" : "Desktop";
  if (/Windows/i.test(ua)) os = "Windows";
  else if (/Mac OS|Macintosh/i.test(ua)) os = "macOS";
  else if (/Linux/i.test(ua)) os = "Linux";
  else if (/Android/i.test(ua)) os = "Android";
  if (/Edg\//i.test(ua)) browser = "Edge";
  else if (/Chrome\//i.test(ua)) browser = "Chrome";
  else if (/Firefox\//i.test(ua)) browser = "Firefox";
  else if (/Safari/i.test(ua) && !/Chrome/i.test(ua)) browser = "Safari";
  return { browser, os, device };
}

/**
 * Persists an audit row for the admin System Logs UI. Swallows errors so callers are not blocked.
 * Pass `headerSource` in Route Handlers so IP/UA match the incoming request.
 */
export async function appendSystemLog(
  params: AppendSystemLogParams,
  headerSource?: Headers,
): Promise<void> {
  try {
    await ensureMongoConnected();
    const h = headerSource ?? (await headers());
    const ua = h.get("user-agent") ?? "";
    const { browser, os, device } = sniffUserAgent(ua);
    const ip = getClientIpFromHeaders(h);
    const userRole = resolveUserRole(params.actorLabels);

    await SystemLogModel.create({
      userId: params.actorId,
      userFullName: params.actorName,
      userRole,
      actionRaw: params.actionRaw,
      action: params.action,
      resourceType: params.resourceType,
      resourceId: params.resourceId,
      metadata: JSON.stringify(params.metadata ?? {}),
      ipAddress: ip,
      browser,
      os,
      device,
      timestamp: new Date(),
    });
  } catch (err) {
    console.error("[appendSystemLog]", err);
  }
}
