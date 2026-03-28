"use server";

import type { ImageResponse } from "../shared/types";
import { withCache } from "../shared/utils";
import { GRIDFS_BUCKETS } from "@/lib/server/gridfs-buckets";
import { downloadFromGridFS } from "@/lib/server/mongodb";

async function _fetchAvatar(
  bucketId: string,
  fileId: string,
): Promise<string> {
  const { buffer } = await downloadFromGridFS({
    bucketName: bucketId,
    fileId,
  });
  return buffer.toString("base64");
}

const fetchAvatar = withCache({
  fn: _fetchAvatar,
  keyPartsGenerator: (bucketId, fileId) => ["avatar-preview", bucketId, fileId],
  tagGenerator: (_bucketId, fileId) => [`avatar-preview-${fileId}`],
  revalidate: 300,
  staticTag: "avatar-preview",
});

export async function getAvatar(fileId: string): Promise<ImageResponse> {
  try {
    const res = await fetchAvatar(GRIDFS_BUCKETS.avatars, fileId);
    if (!res) {
      throw new Error("No avatar set");
    }

    return { ok: true, data: res };
  } catch (err) {
    const message =
      err instanceof Error ? err.message : "Failed to fetch avatar";
    return { ok: false, error: message };
  }
}
