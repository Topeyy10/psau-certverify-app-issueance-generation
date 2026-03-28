"use server";

import { getLoggedInUser } from "./account.action";
import type { UsersList, UsersResponse } from "../shared/types";
import { withCache, withRetry } from "../shared/utils";
import { ensureMongoConnected } from "@/lib/server/mongoose";
import { UserModel } from "@/lib/server/models/User";

async function _fetchAllUser(): Promise<UsersList> {
  return await withRetry({
    fn: async () => {
      await ensureMongoConnected();
      const total = await UserModel.countDocuments();
      return { total };
    },
  });
}

const fetchAllUser = withCache({
  fn: _fetchAllUser,
  staticTag: "global-users-count",
  revalidate: 300,
});

export async function getAllUsersCount(
  refresh?: boolean,
): Promise<UsersResponse> {
  try {
    const currentUser = await getLoggedInUser();
    if (!currentUser) {
      throw new Error("No session");
    }

    const res = await fetchAllUser(refresh);
    if (!res) {
      throw new Error("Failed to fetch all users");
    }

    return { ok: true, data: res };
  } catch (err: unknown) {
    const message =
      err instanceof Error ? err.message : "Failed to fetch all users";
    return { ok: false, error: message };
  }
}
