"use server";

import { getLoggedInUser } from "../auth";
import type { TemplateResponse } from "../shared/types";
import { withCache, withRetry } from "../shared/utils";
import { GRIDFS_BUCKETS } from "@/lib/server/gridfs-buckets";
import { downloadFromGridFS } from "@/lib/server/mongodb";

async function _fetchTemplate(
  fileId: string,
  _userId: string,
): Promise<string> {
  return withRetry({
    fn: async () => {
      const { buffer } = await downloadFromGridFS({
        bucketName: GRIDFS_BUCKETS.templatesJson,
        fileId,
      });
      // UTF-8 text — unstable_cache cannot round-trip ArrayBuffer (becomes {}), which broke Buffer.from in the API route.
      return buffer.toString("utf-8");
    },
  });
}

const fetchTemplate = withCache({
  fn: _fetchTemplate,
  keyPartsGenerator: (_fileId, _userId) =>
    ["user-template", _fileId, _userId] as string[],
  tagGenerator: (fileId, _userId) => [`user-template-${fileId}-${_userId}`],
  staticTag: "user-template",
  revalidate: 300,
});

export async function getTemplate(fileId: string): Promise<TemplateResponse> {
  try {
    const currentUser = await getLoggedInUser();

    if (!currentUser) {
      throw new Error("No session");
    }

    const res = await fetchTemplate(fileId, currentUser.$id);

    if (!res) {
      throw new Error("No template data saved");
    }

    return { ok: true, data: res };
  } catch (err: unknown) {
    const message =
      err instanceof Error ? err.message : "Failed to fetch template JSON";
    return { ok: false, error: message };
  }
}
