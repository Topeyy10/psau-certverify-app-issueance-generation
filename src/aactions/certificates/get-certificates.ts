"use server";

import type { QueryFilter } from "mongoose";
import { ensureMongoConnected } from "@/lib/server/mongoose";
import type { ICertificate } from "@/lib/server/models/Certificate";
import { CertificateModel } from "@/lib/server/models/Certificate";
import { certificateToListItem } from "@/lib/server/mongo-mappers";
import { getLoggedInUser } from "../auth";
import type {
  CertificateData,
  CertificatResponse,
  Ordering,
} from "../shared/types";
import { withCache, withRetry } from "../shared/utils";

const CERTIFICATE_SORT_WHITELIST = new Set([
  "createdAt",
  "updatedAt",
  "recipientFullName",
  "recipientEmail",
  "status",
  "issuer",
  "_id",
]);

function mapSortField(sortBy: string): string {
  const mapped =
    sortBy === "$createdAt"
      ? "createdAt"
      : sortBy === "$updatedAt"
        ? "updatedAt"
        : sortBy;
  if (!CERTIFICATE_SORT_WHITELIST.has(mapped)) {
    return "createdAt";
  }
  return mapped;
}

async function _fetchCertificates(
  searchTerm: string | null,
  status: string,
  order: Ordering,
  sortBy: string,
  limit: number,
  page: number,
  userId: string,
): Promise<CertificateData> {
  await ensureMongoConnected();
  const skip = (page - 1) * limit;
  const sortField = mapSortField(sortBy);
  const sortDir = order === "asc" ? 1 : -1;

  const filter: QueryFilter<ICertificate> = { issuer: userId, isDeleted: false };

  if (searchTerm) {
    if (/^[a-f0-9]{16,32}$/i.test(searchTerm)) {
      filter._id = searchTerm;
    } else {
      filter.recipientFullName = {
        $regex: searchTerm.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"),
        $options: "i",
      };
    }
  }

  if (status !== "any") {
    filter.status = status;
  }

  return await withRetry({
    fn: async () => {
      const [items, total] = await Promise.all([
        CertificateModel.find(filter)
          .sort({ [sortField]: sortDir })
          .skip(skip)
          .limit(limit)
          .lean(),
        CertificateModel.countDocuments(filter),
      ]);

      return {
        items: items.map((d) => certificateToListItem(d)),
        total,
        page,
        limit,
      };
    },
  });
}

const fetchCertificates = withCache({
  fn: _fetchCertificates,
  keyPartsGenerator: (
    searchTerm,
    status,
    order,
    sortBy,
    limit,
    page,
    userId,
  ) => [
    "certificates",
    userId,
    searchTerm ? searchTerm : "",
    status.toString(),
    order,
    sortBy,
    limit.toString(),
    page.toString(),
  ],
  tagGenerator: (
    _searchTerm,
    _status,
    _order,
    _sortBy,
    _limit,
    _page,
    userId,
  ) => [`certificates-${userId}`],
  staticTag: "certificates",
  revalidate: 120,
});

export async function getCertificates(
  page: number,
  limit: number = 10,
  searchTerm: string | null = null,
  sortBy: string = "$createdAt",
  sortOrder: Ordering = "desc",
  status: string = "any",
): Promise<CertificatResponse> {
  try {
    if (!Number.isFinite(page) || page < 1) {
      throw new Error("Page must be a positive number");
    }

    if (!Number.isFinite(limit) || limit < 1 || limit > 50) {
      throw new Error("Limit must be a number between 1 and 50");
    }

    if (sortOrder !== "asc" && sortOrder !== "desc") {
      throw new Error("order must be 'asc' or 'desc'");
    }

    if (typeof sortBy !== "string") {
      throw new Error("sortBy must be a string");
    }

    const currentUser = await getLoggedInUser();
    if (!currentUser) {
      throw new Error("No session");
    }

    const res = await fetchCertificates(
      searchTerm,
      status,
      sortOrder,
      sortBy,
      limit,
      page,
      currentUser.$id,
    );

    if (!res) {
      throw new Error("Failed to fetch certificates");
    }
    return { ok: true, data: res };
  } catch (err: unknown) {
    const errorMessage =
      err instanceof Error ? err.message : "Failed to fetch certificates";
    console.error("getCertificates failed:", err);
    return { ok: false, error: errorMessage };
  }
}
