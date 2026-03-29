import { revalidateTag } from "next/cache";
import { NextResponse } from "next/server";
import { getLoggedInUser } from "@/aactions/auth";
import { uniqueId } from "@/lib/server/id";
import { GRIDFS_BUCKETS } from "@/lib/server/gridfs-buckets";
import { uploadBufferToGridFS } from "@/lib/server/mongodb";
import { CertificateModel } from "@/lib/server/models/Certificate";
import { ensureMongoConnected } from "@/lib/server/mongoose";
import { appendSystemLog } from "@/lib/server/system-log";

export async function POST(request: Request) {
  console.log("UPLOAD HIT at", new Date().toISOString());
  try {
    const currentUser = await getLoggedInUser();
    if (!currentUser) {
      throw new Error("No session");
    }

    const formData = await request.formData();
    const certificateId = formData.get("id") as string;
    const recipientName = formData.get("recipientName") as string;
    const recipientEmail = formData.get("recipientEmail") as string;
    const file = formData.get("file") as File | null;

    if (!certificateId || !recipientName || !recipientEmail || !file) {
      throw new Error(
        "Missing required form data. Contact admin for assistance.",
      );
    }

    console.log("Processing upload for:", certificateId, recipientName);

    const certificateBuffer = Buffer.from(await file.arrayBuffer());
    await ensureMongoConnected();

    const { fileId } = await uploadBufferToGridFS({
      bucketName: GRIDFS_BUCKETS.certificates,
      filename: file.name || `${uniqueId()}.png`,
      buffer: certificateBuffer,
      contentType: file.type || "application/octet-stream",
      metadata: { certificateId, issuer: currentUser.$id },
    });

    await CertificateModel.create({
      _id: certificateId,
      issuer: currentUser.$id,
      recipientFullName: recipientName,
      recipientEmail,
      fileId,
      status: "0",
      isDeleted: false,
    });

    await appendSystemLog(
      {
        actorId: currentUser.$id,
        actorName: currentUser.name,
        actorLabels: currentUser.labels,
        actionRaw: "certificate.issue.upload",
        action: "Issue certificate",
        resourceType: "certificate",
        resourceId: certificateId,
        metadata: { recipientName, recipientEmail },
      },
      request.headers,
    );

    revalidateTag(`certificates-${currentUser.$id}`);

    return NextResponse.json(
      {
        certificateId,
        imageFileId: fileId,
        success: true,
      },
      { status: 200 },
    );
  } catch (error) {
    console.error("Server action error:", error);
    return NextResponse.json(
      {
        certificateId: "",
        imageFileId: "",
        success: false,
        error: error instanceof Error ? error.message : "Server action failed",
      },
      { status: 500 },
    );
  }
}
