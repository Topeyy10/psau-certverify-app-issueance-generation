"use server";

import { getLoggedInUser } from "../auth";
import type { DefaultDocument, DocumentResponse } from "../shared/types";
import { withCache, withRetry } from "../shared/utils";
import { ensureMongoConnected } from "@/lib/server/mongoose";
import { TemplateModel } from "@/lib/server/models/TemplateDoc";

async function _fetchAllTemplates(
  _userId: string,
): Promise<DefaultDocument> {
  return await withRetry({
    fn: async () => {
      await ensureMongoConnected();
      const total = await TemplateModel.countDocuments({
        isDeleted: false,
      });
      return { total, documents: [] };
    },
  });
}

const fetchAllTemplates = withCache({
  fn: _fetchAllTemplates,
  staticTag: "global-templates-count",
  revalidate: 300,
});

export async function getAllTemplatesCount(
  refresh?: boolean,
): Promise<DocumentResponse> {
  try {
    const user = await getLoggedInUser();
    if (!user) {
      throw new Error("No session");
    }

    const res = await fetchAllTemplates(user.$id, refresh);
    if (!res) {
      throw new Error("Failed to fetch active templates");
    }

    return { ok: true, data: res };
  } catch (err: unknown) {
    const message =
      err instanceof Error ? err.message : "Failed to fetch active templates";

    return { ok: false, error: message };
  }
}
