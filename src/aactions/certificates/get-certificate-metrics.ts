"use server";

import { ensureMongoConnected } from "@/lib/server/mongoose";
import { CertificateModel } from "@/lib/server/models/Certificate";
import { getLoggedInUser } from "../auth";
import type { DefaultDocument, DocumentResponse } from "../shared/types";
import { withCache, withRetry } from "../shared/utils";

async function _fetchIssuedCertificatesCount(
  userId: string,
): Promise<DefaultDocument> {
  return await withRetry({
    fn: async () => {
      await ensureMongoConnected();
      const now = new Date();
      const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
      const endOfMonth = new Date(
        now.getFullYear(),
        now.getMonth() + 1,
        0,
        23,
        59,
        59,
        999,
      );

      const total = await CertificateModel.countDocuments({
        issuer: userId,
        status: "1",
        updatedAt: { $gte: startOfMonth, $lte: endOfMonth },
      });

      return { total, documents: [] };
    },
  });
}

const fetchIssuedCertificatesCount = withCache({
  fn: _fetchIssuedCertificatesCount,
  tagGenerator: (_userId) => [`issued-certificates-${_userId}`],
  staticTag: "user-issued-certificate-count",
  revalidate: 300,
});

export async function getIssuedCertificatesCount(
  refresh?: boolean,
): Promise<DocumentResponse> {
  try {
    const user = await getLoggedInUser();
    if (!user) {
      throw new Error("No session");
    }

    const res = await fetchIssuedCertificatesCount(user.$id, refresh);
    if (!res) {
      throw new Error("Failed to fetch issued certificates");
    }

    return { ok: true, data: res };
  } catch (err: unknown) {
    const message =
      err instanceof Error
        ? err.message
        : "Failed to fetch issued certificate this month";

    return { ok: false, error: message };
  }
}

async function _fetchPendingCertificateCount(
  userId: string,
): Promise<DefaultDocument> {
  return await withRetry({
    fn: async () => {
      await ensureMongoConnected();
      const total = await CertificateModel.countDocuments({
        issuer: userId,
        status: "0",
      });
      return { total, documents: [] };
    },
  });
}

const fetchPendingCertificateCount = withCache({
  fn: _fetchPendingCertificateCount,
  tagGenerator: (_userId) => [`pending-certificates-${_userId}`],
  staticTag: "user-pending-certificate-count",
  revalidate: 300,
});

export async function getPendingCertificatesCount(
  refresh?: boolean,
): Promise<DocumentResponse> {
  try {
    const user = await getLoggedInUser();
    if (!user) {
      throw new Error("No session");
    }

    const res = await fetchPendingCertificateCount(user.$id, refresh);
    if (!res) {
      throw new Error("Failed to fetch pending certificates");
    }

    return { ok: true, data: res };
  } catch (err: unknown) {
    const message =
      err instanceof Error
        ? err.message
        : "Failed to fetch pending certificates";

    return { ok: false, error: message };
  }
}

async function _fetchRevokedCertificateCount(
  userId: string,
): Promise<DefaultDocument> {
  return await withRetry({
    fn: async () => {
      await ensureMongoConnected();
      const total = await CertificateModel.countDocuments({
        issuer: userId,
        status: "-1",
      });
      return { total, documents: [] };
    },
  });
}

const fetchRevokedCertificateCount = withCache({
  fn: _fetchRevokedCertificateCount,
  tagGenerator: (_userId) => [`revoked-certificates-${_userId}`],
  staticTag: "user-revoked-certificate-count",
  revalidate: 300,
});

export async function getRevokedCertificatesCount(
  refresh?: boolean,
): Promise<DocumentResponse> {
  try {
    const user = await getLoggedInUser();
    if (!user) {
      throw new Error("No session");
    }

    const res = await fetchRevokedCertificateCount(user.$id, refresh);
    if (!res) {
      throw new Error("Failed to fetch revoked certificates");
    }

    return { ok: true, data: res };
  } catch (err: unknown) {
    const message =
      err instanceof Error
        ? err.message
        : "Failed to fetch revoked certificates";

    return { ok: false, error: message };
  }
}

async function _fetchAllIssuedCertificates(
  _userId: string,
): Promise<DefaultDocument> {
  return await withRetry({
    fn: async () => {
      await ensureMongoConnected();
      const total = await CertificateModel.countDocuments({ status: "1" });
      return { total, documents: [] };
    },
  });
}

const fetchAllIssuedCertificates = withCache({
  fn: _fetchAllIssuedCertificates,
  staticTag: "global-issued-certificates-count",
  revalidate: 300,
});

export async function getAllIssuedCertificateCount(
  refresh?: boolean,
): Promise<DocumentResponse> {
  try {
    const user = await getLoggedInUser();
    if (!user) {
      throw new Error("No session");
    }

    const res = await fetchAllIssuedCertificates(user.$id, refresh);
    if (!res) {
      throw new Error("Failed to fetch issued certificates");
    }

    return { ok: true, data: res };
  } catch (err: unknown) {
    const message =
      err instanceof Error ? err.message : "Failed to fetch issued certificate";

    return { ok: false, error: message };
  }
}
