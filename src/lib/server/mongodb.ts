import { GridFSBucket, ObjectId } from "mongodb";
import mongoose from "mongoose";
import { ensureMongoConnected } from "./mongoose";

export async function getGridFSBucket(bucketName: string) {
  await ensureMongoConnected();
  const db = mongoose.connection.db;
  if (!db) {
    throw new Error("MongoDB is connected but database handle is missing");
  }
  return new GridFSBucket(db, { bucketName });
}

export async function uploadBufferToGridFS(params: {
  bucketName: string;
  filename: string;
  buffer: Buffer;
  contentType?: string;
  metadata?: Record<string, unknown>;
}): Promise<{ fileId: string }> {
  const { bucketName, filename, buffer, contentType, metadata } = params;
  const bucket = await getGridFSBucket(bucketName);

  const gridMetadata: Record<string, unknown> = { ...(metadata ?? {}) };
  if (contentType) {
    gridMetadata.contentType = contentType;
  }
  const uploadOptions =
    Object.keys(gridMetadata).length > 0 ? { metadata: gridMetadata } : undefined;

  return await new Promise((resolve, reject) => {
    const uploadStream = bucket.openUploadStream(filename, uploadOptions);

    uploadStream.on("error", reject);
    uploadStream.on("finish", () => {
      resolve({ fileId: uploadStream.id.toString() });
    });

    uploadStream.end(buffer);
  });
}

export async function downloadFromGridFS(params: {
  bucketName: string;
  fileId: string;
}): Promise<{
  buffer: Buffer;
  filename?: string;
  contentType?: string;
  length?: number;
}> {
  const { bucketName, fileId } = params;
  const bucket = await getGridFSBucket(bucketName);
  const _id = new ObjectId(fileId);

  const chunks: Buffer[] = [];
  await new Promise<void>((resolve, reject) => {
    const downloadStream = bucket.openDownloadStream(_id);
    downloadStream.on("data", (chunk) => chunks.push(Buffer.from(chunk)));
    downloadStream.on("error", reject);
    downloadStream.on("end", () => resolve());
  });

  const filesCollection = mongoose.connection.collection(`${bucketName}.files`);
  const fileDoc = await filesCollection.findOne({ _id });
  const doc = fileDoc as unknown as
    | {
        filename?: string;
        length?: number;
        contentType?: unknown;
        metadata?: unknown;
      }
    | null
    | undefined;
  const meta = doc?.metadata as Record<string, unknown> | undefined;
  const contentTypeFromMeta =
    meta && typeof meta.contentType === "string" ? meta.contentType : undefined;
  const contentTypeRoot = typeof doc?.contentType === "string" ? doc.contentType : undefined;

  return {
    buffer: Buffer.concat(chunks),
    filename: doc?.filename,
    contentType: contentTypeRoot ?? contentTypeFromMeta,
    length: doc?.length,
  };
}

export async function deleteFromGridFS(params: {
  bucketName: string;
  fileId: string;
}): Promise<void> {
  const { bucketName, fileId } = params;
  const bucket = await getGridFSBucket(bucketName);
  const _id = new ObjectId(fileId);

  await bucket.delete(_id);
}

