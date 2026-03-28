import { type NextRequest, NextResponse } from "next/server";
import { getCertificateFiles } from "@/aactions/certificates";

export async function GET(
  req: NextRequest,
  context: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await context.params;
    const url = new URL(req.url);
    const format = (url.searchParams.get("format") || "pdf").toLowerCase();

    if (!["pdf", "jpg", "jpeg"].includes(format)) {
      return NextResponse.json(
        { ok: false, error: "Invalid format. Must be pdf or jpg" },
        { status: 400 },
      );
    }

    const res = await getCertificateFiles(id, format);

    if (!res.ok || !res.data) {
      return NextResponse.json(
        { ok: false, error: res.error || "File not found" },
        { status: 404 },
      );
    }

    const { fileBuffer, filename } = res.data;
    const mimeType = format === "pdf" ? "application/pdf" : "image/jpeg";

    return new NextResponse(fileBuffer as ArrayBuffer, {
      headers: {
        "Content-Type": mimeType,
        "Content-Disposition": `attachment; filename="${filename}"`,
        "Cache-Control": "public, max-age=90, immutable",
      },
    });
  } catch (err: unknown) {
    const message =
      err instanceof Error
        ? err.message
        : "Failed to download certificate";
    return NextResponse.json({ ok: false, error: message }, { status: 500 });
  }
}
