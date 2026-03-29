"use server";

import type { SystemLogs, SystemLogsResponse } from "../shared/types";
import { ensureMongoConnected } from "@/lib/server/mongoose";
import { SystemLogModel } from "@/lib/server/models/SystemLogDoc";

function mapSortField(sortBy: string): string {
  if (sortBy === "$createdAt") return "timestamp";
  if (sortBy === "userRole") return "userRole";
  return sortBy;
}

export async function getLogs(
  page: number,
  limit: number,
  sortBy: string,
  sortOrder: "asc" | "desc",
): Promise<SystemLogsResponse> {
  try {
    await ensureMongoConnected();
    const skip = (page - 1) * limit;
    const sortField = mapSortField(sortBy);
    const sortDir = sortOrder === "asc" ? 1 : -1;

    const [docs, total] = await Promise.all([
      SystemLogModel.find()
        .sort({ [sortField]: sortDir })
        .skip(skip)
        .limit(limit)
        .lean(),
      SystemLogModel.countDocuments(),
    ]);

    const documents = docs.map((d) => ({
      $id: String(d._id),
      $createdAt: d.timestamp instanceof Date
        ? d.timestamp.toISOString()
        : new Date(0).toISOString(),
      $updatedAt: d.timestamp instanceof Date
        ? d.timestamp.toISOString()
        : new Date(0).toISOString(),
      userId: d.userId,
      userFullName: d.userFullName,
      userRole: d.userRole ?? "unknown",
      actionRaw: d.actionRaw,
      action: d.action,
      resourceType: d.resourceType,
      resourceId: d.resourceId,
      metadata: d.metadata,
      ipAddress: d.ipAddress,
      browser: d.browser,
      os: d.os,
      device: d.device,
      timestamp: d.timestamp,
    }));

    const res: SystemLogs = { total, documents: documents as SystemLogs["documents"] };

    return { ok: true, data: res };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Failed to fetch logs";
    return { ok: false, error: message };
  }
}
