"use server";

import type { HealthResponse } from "../shared/types";
import { ensureMongoConnected } from "@/lib/server/mongoose";

export async function getHealth(): Promise<HealthResponse> {
  try {
    const start = Date.now();
    await ensureMongoConnected();
    const ping = Date.now() - start;

    return {
      ok: true,
      data: {
        health: "online",
        timestamp: new Date(),
        ping,
      },
    };
  } catch (err: unknown) {
    const message =
      err instanceof Error
        ? err.message
        : "Failed to fetch system health and status";
    throw new Error(message);
  }
}
