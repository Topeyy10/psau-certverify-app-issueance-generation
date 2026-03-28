"use server";

import { getLoggedInUser } from "../auth";
import { withCache, withRetry } from "../shared/utils";
import { ensureMongoConnected } from "@/lib/server/mongoose";
import { TemplateModel } from "@/lib/server/models/TemplateDoc";

async function _fetchTemplateCount(userId: string): Promise<number> {
  return await withRetry({
    fn: async () => {
      await ensureMongoConnected();
      return TemplateModel.countDocuments({
        author: userId,
        isDeleted: false,
      });
    },
  });
}

const fetchTemplateCount = withCache({
  fn: _fetchTemplateCount,
  tagGenerator: (userId: string) => [`template-count-${userId}`],
  staticTag: "user-template-count",
  revalidate: 300,
});

export async function getTemplateCount(refresh?: boolean) {
  try {
    const currentUser = await getLoggedInUser();
    if (!currentUser) {
      throw new Error("No session");
    }

    const count = await fetchTemplateCount(currentUser.$id, refresh);
    return { ok: true, data: count };
  } catch (err: unknown) {
    const message =
      err instanceof Error ? err.message : "Failed to fetch template count";
    return { ok: false, error: message };
  }
}
