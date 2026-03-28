import { NextResponse } from "next/server";
import { getAvatar } from "@/aactions/avatar";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const fileId = searchParams.get("fileId");

  if (!fileId) {
    return new NextResponse("File ID required", { status: 400 });
  }

  try {
    const res = await getAvatar(fileId);
    if (!res.ok) {
      throw new Error(res.error);
    }

    const buffer = Buffer.from(res.data, "base64");
    return new NextResponse(buffer, {
      headers: {
        "Content-Type": "image/jpeg", // TODO or detect actual mime type if possible
        "Cache-Control": "public, max-age=300, immutable", // Cache for 5 min
      },
    });
  } catch (err) {
    const message =
      err instanceof Error ? err.message : "Internal server error";
    console.error(message + ":" + (err instanceof Error ? err.stack : err));
    return new NextResponse(message, { status: 404 });
  }
}
