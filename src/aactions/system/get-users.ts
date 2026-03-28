"use server";

import type { QueryFilter } from "mongoose";
import { getLoggedInUser } from "@/aactions/auth";
import type { Ordering, UserData, UserDataReponse } from "../shared/types";
import { withCache, withRetry } from "../shared/utils";
import type { IUser } from "@/lib/server/models/User";
import { UserModel } from "@/lib/server/models/User";
import { ensureMongoConnected } from "@/lib/server/mongoose";

const USER_SORT_WHITELIST = new Set([
  "createdAt",
  "updatedAt",
  "name",
  "email",
  "userId",
]);

function mapSortField(sortBy: string): string {
  const mapped =
    sortBy === "$createdAt"
      ? "createdAt"
      : sortBy === "$updatedAt"
        ? "updatedAt"
        : sortBy;
  if (!USER_SORT_WHITELIST.has(mapped)) {
    return "createdAt";
  }
  return mapped;
}

async function _fetchUsers(
  searchTerm: string | null,
  role: string,
  order: Ordering,
  sortBy: string,
  limit: number,
  page: number,
  currentUserId: string,
): Promise<UserData> {
  const offset = (page - 1) * limit;
  const sortField = mapSortField(sortBy);
  const sortDir = order === "asc" ? 1 : -1;

  const filter: QueryFilter<IUser> = {};

  if (searchTerm?.match(/^[a-f0-9]{16,32}$/i)) {
    filter.userId = searchTerm;
  } else {
    const andParts: QueryFilter<IUser>[] = [
      { userId: { $ne: currentUserId } },
    ];
    if (searchTerm) {
      const escaped = searchTerm.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
      andParts.push({
        $or: [
          { name: { $regex: escaped, $options: "i" } },
          { email: { $regex: escaped, $options: "i" } },
        ],
      });
    }
    filter.$and = andParts;
  }

  if (role !== "any") {
    if (role !== "admin" && role !== "issuer" && role !== "user") {
      throw new Error("Role must be 'admin', 'issuer', 'user', or 'any'");
    }
    filter.labels = role as IUser["labels"][number];
  }

  return await withRetry({
    fn: async () => {
      await ensureMongoConnected();
      const [users, total] = await Promise.all([
        UserModel.find(filter)
          .sort({ [sortField]: sortDir })
          .skip(offset)
          .limit(limit)
          .lean(),
        UserModel.countDocuments(filter),
      ]);

      const sanitizedItems = users.map((user) => ({
        $id: user.userId,
        name: user.name,
        email: user.email,
        role: user.labels.includes("admin")
          ? "admin"
          : user.labels.includes("issuer")
            ? "issuer"
            : "user",
        $createdAt: user.createdAt?.toISOString() ?? "",
        $updatedAt: user.updatedAt?.toISOString() ?? "",
        avatarId: (user.prefs as { avatarFileId?: string })?.avatarFileId ?? "",
        isEmailVerified: user.emailVerification,
        isBlocked: !user.status,
      }));

      return {
        items: sanitizedItems,
        total,
        page,
        limit,
      };
    },
  });
}

const fetchUsers = withCache({
  fn: _fetchUsers,
  keyPartsGenerator: (
    searchTerm,
    role,
    order,
    sortBy,
    limit,
    page,
    currentUserId,
  ) => [
    "users",
    currentUserId,
    searchTerm ? searchTerm : "",
    role.toString(),
    order,
    sortBy,
    limit.toString(),
    page.toString(),
  ],
  tagGenerator: (
    _searchTerm,
    _role,
    _order,
    _sortBy,
    _limit,
    _page,
    currentUserId,
  ) => [`users-${currentUserId}`],
  staticTag: "users",
  revalidate: 120,
});

export async function getUsers(
  page: number,
  limit: number = 10,
  searchTerm: string | null = null,
  sortBy: string = "$createdAt",
  sortOrder: Ordering = "desc",
  role: string = "any",
): Promise<UserDataReponse> {
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
    if (!currentUser.labels.includes("admin")) {
      throw new Error("Unauthorized: Admin access required");
    }

    const res = await fetchUsers(
      searchTerm,
      role,
      sortOrder,
      sortBy,
      limit,
      page,
      currentUser.$id,
    );

    if (!res) {
      throw new Error("Failed to fetch users");
    }
    return { ok: true, data: res };
  } catch (err: unknown) {
    const errorMessage =
      err instanceof Error ? err.message : "Failed to fetch users";
    console.error("getUsers failed:", err);
    return { ok: false, error: errorMessage };
  }
}
