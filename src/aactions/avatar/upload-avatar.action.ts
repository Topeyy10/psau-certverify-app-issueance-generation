"use server";

import { revalidateTag } from "next/cache";
import sharp from "sharp";
import { getLoggedInUser } from "../auth";
import type { VoidActionResponse } from "../shared/types";
import { getSafeFilename } from "../shared/utils/file";
import { updatePrefs } from "../shared/utils/preferences";
import { GRIDFS_BUCKETS } from "@/lib/server/gridfs-buckets";
import { uploadBufferToGridFS, deleteFromGridFS } from "@/lib/server/mongodb";

export async function updateProfilePhoto(
  file: File,
): Promise<VoidActionResponse> {
  try {
    const currentUser = await getLoggedInUser();

    if (!currentUser) {
      throw new Error("No session");
    }

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    const resizedBuffer = await sharp(buffer)
      .resize({ width: 500, height: 500, fit: "cover", position: "center" })
      .jpeg({ quality: 90 })
      .toBuffer();

    const securerFileName = getSafeFilename(file);

    const { fileId: storedId } = await uploadBufferToGridFS({
      bucketName: GRIDFS_BUCKETS.avatars,
      filename: securerFileName,
      buffer: resizedBuffer,
      contentType: "image/jpeg",
      metadata: { userId: currentUser.$id },
    });

    const oldFileId = (currentUser.prefs as { avatarFileId?: string })
      .avatarFileId;
    if (oldFileId) {
      try {
        await deleteFromGridFS({
          bucketName: GRIDFS_BUCKETS.avatars,
          fileId: oldFileId,
        });
      } catch (deleteError) {
        console.warn(
          `Failed to delete previous avatar ${oldFileId}:`,
          deleteError,
        );
      } finally {
        revalidateTag(`avatar-preview-${oldFileId}`);
      }
    }

    const result = await updatePrefs({ avatarFileId: storedId });
    if (!result.ok) {
      throw new Error(result.error);
    }

    return { ok: true };
  } catch (err: unknown) {
    const message =
      err instanceof Error
        ? err.message
        : "An unknown error occurred while updating the profile photo.";
    console.error(message);
    return { ok: false, error: message };
  }
}
