"use server";

import { revalidateTag } from "next/cache";
import { getLoggedInUser } from "../auth";
import { uniqueId } from "@/lib/server/id";
import { GRIDFS_BUCKETS } from "@/lib/server/gridfs-buckets";
import { uploadBufferToGridFS, deleteFromGridFS } from "@/lib/server/mongodb";
import { TemplateModel } from "@/lib/server/models/TemplateDoc";
import { ensureMongoConnected } from "@/lib/server/mongoose";
import { appendSystemLog } from "@/lib/server/system-log";

export async function saveTemplate(formData: FormData) {
  const currentUser = await getLoggedInUser();
  if (!currentUser) {
    throw new Error("No session");
  }

  const jsonFile = formData.get("jsonFile") as File | null;
  if (!jsonFile) throw new Error("Missing template data. Please try again");

  const screenshotFile = formData.get("screenshot") as File | null;
  if (!screenshotFile) throw new Error("Missing cover data. Please try again");

  const name = formData.get("name") as string;
  const size = JSON.parse((formData.get("size") as string) || "{}");
  const isPortrait = JSON.parse((formData.get("isPortrait") as string) || "{}");

  const templateId = formData.get("templateId") as string | null;

  if (!size?.w || !size?.h || !size?.label) {
    throw new Error(
      "Missing required size properties: width, height, or label",
    );
  }

  await ensureMongoConnected();

  const baseFileName = uniqueId();

  let existing: {
    jsonFileId?: string;
    coverFileId?: string;
  } | null = null;
  if (templateId) {
    const doc = await TemplateModel.findById(templateId).lean();
    if (doc) {
      existing = {
        jsonFileId: doc.jsonFileId,
        coverFileId: doc.coverFileId,
      };
    }
  }

  const jsonBuffer = Buffer.from(await jsonFile.arrayBuffer());
  const templateData = await uploadBufferToGridFS({
    bucketName: GRIDFS_BUCKETS.templatesJson,
    filename: `${baseFileName}.json`,
    buffer: jsonBuffer,
    contentType: "application/json",
  });

  const coverImageBuffer = Buffer.from(await screenshotFile.arrayBuffer());
  const templateCoverData = await uploadBufferToGridFS({
    bucketName: GRIDFS_BUCKETS.templatesCover,
    filename: `${baseFileName}.jpeg`,
    buffer: coverImageBuffer,
    contentType: "image/jpeg",
  });

  revalidateTag(`user-templates-${currentUser.$id}`);
  revalidateTag(`template-count-${currentUser.$id}`);

  if (templateId && existing) {
    if (existing.jsonFileId) {
      try {
        await deleteFromGridFS({
          bucketName: GRIDFS_BUCKETS.templatesJson,
          fileId: existing.jsonFileId,
        });
      } catch (err: unknown) {
        console.error(
          "Cant delete JSON template:",
          err instanceof Error ? err.message : err,
        );
      }
    }

    if (existing.coverFileId) {
      try {
        await deleteFromGridFS({
          bucketName: GRIDFS_BUCKETS.templatesCover,
          fileId: existing.coverFileId,
        });
      } catch (err: unknown) {
        console.error(
          "Cannot delete cover image:",
          err instanceof Error ? err.message : err,
        );
      }
    }

    await TemplateModel.updateOne(
      { _id: templateId },
      {
        $set: {
          jsonFileId: templateData.fileId,
          coverFileId: templateCoverData.fileId,
        },
      },
    );

    await appendSystemLog({
      actorId: currentUser.$id,
      actorName: currentUser.name,
      actorLabels: currentUser.labels,
      actionRaw: "template.save.update",
      action: "Save template",
      resourceType: "template",
      resourceId: templateId,
      metadata: { name, mode: "update" },
    });

    return { ok: true, id: templateId };
  }

  const documentId = uniqueId();
  await TemplateModel.create({
    _id: documentId,
    author: currentUser.$id,
    name,
    coverFileId: templateCoverData.fileId,
    jsonFileId: templateData.fileId,
    width: size.w,
    height: size.h,
    paper: size.label,
    isPortrait,
    isDeleted: false,
  });

  await appendSystemLog({
    actorId: currentUser.$id,
    actorName: currentUser.name,
    actorLabels: currentUser.labels,
    actionRaw: "template.save.create",
    action: "Create template",
    resourceType: "template",
    resourceId: documentId,
    metadata: { name, mode: "create" },
  });

  return { ok: true, id: documentId };
}
