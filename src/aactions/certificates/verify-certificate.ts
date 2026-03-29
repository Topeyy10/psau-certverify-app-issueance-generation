"use server";

import { ensureMongoConnected } from "@/lib/server/mongoose";
import { CertificateModel } from "@/lib/server/models/Certificate";
import { appendSystemLog } from "@/lib/server/system-log";
import type { Certificate } from "../shared/types";

export async function verifyCertificateId(id: string) {
  try {
    if (!id) {
      await appendSystemLog({
        actorId: "public",
        actorName: "Public verification",
        actorLabels: ["user"],
        actionRaw: "certificate.verify.missing_id",
        action: "Verify certificate",
        resourceType: "certificate",
        resourceId: "unknown",
        metadata: {},
      });
      return { ok: false, error: "Certificate ID is required" };
    }

    await ensureMongoConnected();
    const doc = await CertificateModel.findOne({
      _id: id,
      status: { $in: ["-1", "1"] },
    }).lean();

    await appendSystemLog({
      actorId: "public",
      actorName: "Public verification",
      actorLabels: ["user"],
      actionRaw: doc ? "certificate.verify.lookup" : "certificate.verify.not_found",
      action: "Verify certificate",
      resourceType: "certificate",
      resourceId: id,
      metadata: {
        found: !!doc,
        status: doc ? String((doc as { status?: string }).status) : null,
      },
    });

    if (!doc) {
      return {
        ok: true,
        error: "Certificate not found or invalid status",
        data: { validity: false, status: "0", id, data: null },
      };
    }

    const certificate = doc as unknown as Certificate;
    return {
      ok: true,
      data: {
        validity: true,
        id,
        status: certificate.status,
        data: {
          id,
          holderName: certificate.recipientFullName,
          issuer: certificate.issuer,
          issuanceDate:
            doc.createdAt?.toISOString() ?? new Date(0).toISOString(),
        },
      },
    };
  } catch (error: unknown) {
    const message =
      error instanceof Error ? error.message : "Failed to verify certificate";
    return { ok: false, error: message };
  }
}
