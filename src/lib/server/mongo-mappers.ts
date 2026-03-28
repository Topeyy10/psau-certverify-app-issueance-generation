import type { Certificate, Status } from "@/aactions/shared/types";
import type { ICertificate } from "@/lib/server/models/Certificate";

export function certificateToListItem(
  doc: Pick<
    ICertificate,
    | "_id"
    | "issuer"
    | "recipientFullName"
    | "recipientEmail"
    | "fileId"
    | "status"
    | "isDeleted"
    | "createdAt"
    | "updatedAt"
  >,
): Certificate {
  const created = doc.createdAt as Date | undefined;
  const updated = doc.updatedAt as Date | undefined;
  return {
    $id: String(doc._id),
    $createdAt:
      created instanceof Date
        ? created.toISOString()
        : new Date(0).toISOString(),
    $updatedAt:
      updated instanceof Date
        ? updated.toISOString()
        : new Date(0).toISOString(),
    issuer: String(doc.issuer),
    recipientFullName: String(doc.recipientFullName),
    fileId: String(doc.fileId),
    status: doc.status as Status,
    recipientEmail: String(doc.recipientEmail),
    isDeleted: Boolean(doc.isDeleted),
  };
}
