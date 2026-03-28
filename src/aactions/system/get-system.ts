"use server";

import * as os from "node:os";
import type { SystemResponse } from "../shared/types";

function buildCpu() {
  const cpus = os.cpus();
  const coreCount = Math.max(1, cpus.length);
  // Load average is useful on Unix; on Windows it is typically [0,0,0].
  const load = process.platform === "win32" ? 0 : (os.loadavg()[0] ?? 0);
  // Widget expects a 0–1 fraction (same as `memoryUsagePercent`).
  const usagePercent = Math.min(1, load / coreCount);
  const first = cpus[0];
  return {
    cpu: {
      coreCount: String(cpus.length || 0),
      cpuSpeedMhz: first?.speed ?? 0,
      usagePercent,
      status: usagePercent > 0.9 ? "high" : "ok",
    },
  };
}

function buildMemory() {
  const totalMem = os.totalmem();
  const freeMem = os.freemem();
  const usedMem = totalMem - freeMem;
  const memoryUsagePercent = totalMem > 0 ? usedMem / totalMem : 0;
  return {
    memory: {
      totalMem,
      freeMem,
      usedMem,
      memoryUsagePercent,
      status: memoryUsagePercent > 0.9 ? "high" : "ok",
    },
  };
}

function buildSystem() {
  const cpus = os.cpus();
  const first = cpus[0];
  const userInfo = os.userInfo();
  return {
    system: {
      hostname: os.hostname(),
      platform: os.platform(),
      architecture: os.arch(),
      release: os.release(),
      type: os.type(),
      userInfo: {
        uuid: String(userInfo.uid),
        gid: String(userInfo.gid),
        username: userInfo.username,
        homedir: userInfo.homedir,
        shell: userInfo.shell ?? "",
      },
      cpuSpeedMhz: String(first?.speed ?? 0),
      cpuModel: first?.model ?? "",
      cpuCores: String(cpus.length || 0),
    },
  };
}

export async function getSystemMetrics(
  metric: "cpu" | "memory" | "system" | "all" = "all",
): Promise<SystemResponse> {
  try {
    if (metric === "cpu") {
      return { ok: true, data: buildCpu() } as SystemResponse;
    }
    if (metric === "memory") {
      return { ok: true, data: buildMemory() } as SystemResponse;
    }
    if (metric === "system") {
      return { ok: true, data: buildSystem() } as SystemResponse;
    }

    const cpu = buildCpu();
    const memory = buildMemory();
    const system = buildSystem();

    return {
      ok: true,
      data: {
        cpu: cpu.cpu,
        memory: memory.memory,
        system: system.system,
      },
    };
  } catch (err: unknown) {
    const message =
      err instanceof Error ? err.message : "Failed to fetch system info";
    return { ok: false, error: message };
  }
}
