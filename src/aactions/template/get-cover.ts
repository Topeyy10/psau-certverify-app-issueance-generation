"use server";

import type { ImageResponse } from "../shared/types";
import { withCache, withRetry } from "../shared/utils";
import { GRIDFS_BUCKETS } from "@/lib/server/gridfs-buckets";
import { downloadFromGridFS } from "@/lib/server/mongodb";

async function _fetchTemplateCover(fileId: string): Promise<string> {
  return withRetry({
    fn: async () => {
      const { buffer } = await downloadFromGridFS({
        bucketName: GRIDFS_BUCKETS.templatesCover,
        fileId,
      });
      return buffer.toString("base64");
    },
  });
}

const fetchTemplateCover = withCache({
  fn: _fetchTemplateCover,
  keyPartsGenerator: (fileId) => ["template-cover", fileId],
  tagGenerator: (_fileId) => [`template-cover-${_fileId}`],
  staticTag: "template-cover",
  revalidate: 300,
});

export async function getTemplateCover(fileId: string): Promise<ImageResponse> {
  try {
    const res = await fetchTemplateCover(fileId);

    if (!res) {
      throw new Error("No cover file");
    }

    return { ok: true, data: res };
  } catch (err: unknown) {
    const message =
      err instanceof Error ? err.message : "Failed to fetch template cover";
    return { ok: false, error: message };
  }
}
