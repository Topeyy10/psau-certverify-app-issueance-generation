"use server";

import { revalidateTag } from "next/cache";
import { getLoggedInUser } from "../auth";
import { GRIDFS_BUCKETS } from "@/lib/server/gridfs-buckets";
import { deleteFromGridFS } from "@/lib/server/mongodb";
import { TemplateModel } from "@/lib/server/models/TemplateDoc";
import { ensureMongoConnected } from "@/lib/server/mongoose";

export async function deleteTemplateById(id: string) {
  const currentUser = await getLoggedInUser();

  if (!id) throw new Error("Template id is missing");

  await ensureMongoConnected();

  const existing = await TemplateModel.findById(id).lean();
  if (!existing) throw new Error("Template not found");

  const { jsonFileId, coverFileId } = existing;

  await TemplateModel.updateOne({ _id: id }, { $set: { isDeleted: true } });

  if (currentUser) {
    revalidateTag(`user-templates-${currentUser.$id}`);
    revalidateTag(`template-count-${currentUser.$id}`);
    revalidateTag("user-template-count");
  }

  try {
    if (jsonFileId) {
      await deleteFromGridFS({
        bucketName: GRIDFS_BUCKETS.templatesJson,
        fileId: jsonFileId,
      });
    }
    if (coverFileId) {
      await deleteFromGridFS({
        bucketName: GRIDFS_BUCKETS.templatesCover,
        fileId: coverFileId,
      });
    }

    await TemplateModel.deleteOne({ _id: id });
  } catch (cleanupErr) {
    console.error(
      `Cleanup failed for template ${id}. Template is soft-deleted, retry later.`,
      cleanupErr,
    );
  }

  return { ok: true };
}
