"use server";

import type { CertificateStatus } from "@/types";
import { ensureMongoConnected } from "@/lib/server/mongoose";
import { CertificateModel } from "@/lib/server/models/Certificate";
import type { VoidActionResponse } from "../shared/types";

export async function updateCertificateStatus(
  status: CertificateStatus,
  id: string,
): Promise<VoidActionResponse> {
  try {
    await ensureMongoConnected();
    const res = await CertificateModel.updateOne(
      { _id: id },
      { $set: { status } },
    );
    if (res.matchedCount === 0) {
      return { ok: false, error: "Certificate not found" };
    }
    return { ok: true };
  } catch (err: unknown) {
    const message =
      err instanceof Error
        ? err.message
        : `Failed to update status for certificate id: ${id}`;
    return { ok: false, error: message };
  }
}
