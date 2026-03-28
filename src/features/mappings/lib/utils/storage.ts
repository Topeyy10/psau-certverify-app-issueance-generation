"use server";

import { getLoggedInUser } from "@/aactions/auth";
import { MAX_RETRIES } from "../constants";
import type { GenerationResult, StorageResult } from "../types";
import { GRIDFS_BUCKETS } from "@/lib/server/gridfs-buckets";
import { uploadBufferToGridFS } from "@/lib/server/mongodb";
import { CertificateModel } from "@/lib/server/models/Certificate";
import { ensureMongoConnected } from "@/lib/server/mongoose";

export const uploadCertificateToStorage = async (
  generationResult: GenerationResult,
  retryCount = 0,
): Promise<StorageResult> => {
  try {
    const currentUser = await getLoggedInUser();
    if (!currentUser) {
      throw new Error("No session");
    }

    const response = await fetch(generationResult.url);
    const blob = await response.blob();
    const buffer = Buffer.from(await blob.arrayBuffer());

    await ensureMongoConnected();

    const { fileId } = await uploadBufferToGridFS({
      bucketName: GRIDFS_BUCKETS.certificates,
      filename: `certificate-${generationResult.id}.png`,
      buffer,
      contentType: "image/png",
      metadata: { certificateId: generationResult.id },
    });

    await CertificateModel.create({
      _id: generationResult.id,
      issuer: currentUser.$id,
      recipientFullName: generationResult.meta.recipientName,
      recipientEmail: generationResult.meta.recipientEmail,
      fileId,
      status: "0",
      isDeleted: false,
    });

    return {
      certificateId: generationResult.id,
      imageFileId: fileId,
      success: true,
    };
  } catch (error) {
    console.error(
      `Upload attempt ${retryCount + 1} failed for ${generationResult.id}:`,
      error,
    );
    if (retryCount < MAX_RETRIES - 1) {
      await new Promise((resolve) =>
        setTimeout(resolve, 1000 * (retryCount + 1)),
      );
      return uploadCertificateToStorage(generationResult, retryCount + 1);
    }
    return {
      certificateId: generationResult.id,
      imageFileId: "",
      success: false,
      error: error instanceof Error ? error.message : "Upload failed",
    };
  }
};
