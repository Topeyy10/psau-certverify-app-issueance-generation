import { GridFSBucket, ObjectId } from "mongodb";
import mongoose from "mongoose";
import { ensureMongoConnected } from "./mongoose";

export async function getGridFSBucket(bucketName: string) {
  await ensureMongoConnected();
  return new GridFSBucket(mongoose.connection.db, { bucketName });
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

  return await new Promise((resolve, reject) => {
    const uploadStream = bucket.openUploadStream(filename, {
      contentType,
      metadata,
    });

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

  return {
    buffer: Buffer.concat(chunks),
    filename: fileDoc?.filename,
    contentType: fileDoc?.contentType,
    length: fileDoc?.length,
  };
}

export async function deleteFromGridFS(params: {
  bucketName: string;
  fileId: string;
}): Promise<void> {
  const { bucketName, fileId } = params;
  const bucket = await getGridFSBucket(bucketName);
  const _id = new ObjectId(fileId);

  await new Promise<void>((resolve, reject) => {
    bucket.delete(_id, (err) => (err ? reject(err) : resolve()));
  });
}

