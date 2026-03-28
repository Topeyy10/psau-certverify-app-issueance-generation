"use server";

import { jsPDF } from "jspdf";
import sharp from "sharp";
import { STANDARD_DPI } from "@/features/dashboard/shared/constants/paper";
import { ensureMongoConnected } from "@/lib/server/mongoose";
import { CertificateModel } from "@/lib/server/models/Certificate";
import { downloadFromGridFS } from "@/lib/server/mongodb";
import { GRIDFS_BUCKETS } from "@/lib/server/gridfs-buckets";
import type {
  CertificateFile,
  CertificateFileResponse,
  CertificateMetadata,
} from "../shared/types";
import { sanitizeFilename, withCache, withRetry } from "../shared/utils";

async function _fetchCertificateMetadata(
  certificateId: string,
  format: string,
): Promise<CertificateMetadata> {
  return await withRetry({
    fn: async () => {
      await ensureMongoConnected();
      const certificate = await CertificateModel.findById(certificateId).lean();
      if (!certificate) {
        throw new Error("Certificate not found");
      }
      return {
        recipient: certificate.recipientFullName,
        filename: `${sanitizeFilename(certificate.recipientFullName)}.${format}`,
        fileId: certificate.fileId,
      };
    },
  });
}

const fetchCertificateMetadata = withCache({
  fn: _fetchCertificateMetadata,
  revalidate: 300,
  keyPartsGenerator: (certificateId, format) => [
    "certificate-metadata",
    certificateId,
    format,
  ],
  staticTag: "certificate-metadata",
});

async function _fetchCertificateFile(
  metadata: CertificateMetadata,
  format: string,
): Promise<CertificateFile> {
  return await withRetry({
    fn: async () => {
      const { buffer: fileBufferRaw } = await downloadFromGridFS({
        bucketName: GRIDFS_BUCKETS.certificates,
        fileId: metadata.fileId,
      });
      let convertedBuffer: Buffer<ArrayBufferLike> = Buffer.from(fileBufferRaw);

      if (format === "jpg" || format === "jpeg") {
        convertedBuffer = await sharp(convertedBuffer)
          .jpeg({ quality: 80 })
          .toBuffer();
      } else if (format === "pdf") {
        const image = sharp(convertedBuffer);
        const imgMetadata = await image.metadata();

        const targetWidth = 1920;
        const scaleFactor = Math.min(1, targetWidth / (imgMetadata.width ?? 1));
        const targetHeight = Math.round((imgMetadata.height ?? 0) * scaleFactor);

        const compressedBuffer = await image
          .resize({ width: targetWidth, height: targetHeight })
          .jpeg({ quality: 80 })
          .toBuffer();

        const dpi = STANDARD_DPI;
        const pdfWidth = (targetWidth / dpi) * 72;
        const pdfHeight = (targetHeight / dpi) * 72;

        const pdf = new jsPDF({
          orientation: pdfWidth > pdfHeight ? "landscape" : "portrait",
          unit: "pt",
          format: [pdfWidth, pdfHeight],
          compress: true,
        });

        const base64 = compressedBuffer.toString("base64");
        pdf.addImage(
          `data:image/jpeg;base64,${base64}`,
          "JPEG",
          0,
          0,
          pdfWidth,
          pdfHeight,
        );

        convertedBuffer = Buffer.from(pdf.output("arraybuffer"));
      }

      const arrayBuffer = convertedBuffer.buffer.slice(
        convertedBuffer.byteOffset,
        convertedBuffer.byteOffset + convertedBuffer.byteLength,
      );

      return { fileBuffer: arrayBuffer, filename: metadata.filename };
    },
  });
}

export async function getCertificateFiles(
  certificateId: string,
  format: string,
): Promise<CertificateFileResponse> {
  try {
    const metadata = await fetchCertificateMetadata(certificateId, format);

    const res = await _fetchCertificateFile(metadata, format);

    if (!res) {
      throw new Error("File not found");
    }

    return { ok: true, data: res };
  } catch (err: unknown) {
    const message =
      err instanceof Error ? err.message : "Failed to fetch certificate";
    return { ok: false, error: message };
  }
}
