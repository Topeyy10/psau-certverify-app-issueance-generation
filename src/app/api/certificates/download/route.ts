import { zipSync } from "fflate";
import { type NextRequest, NextResponse } from "next/server";
import { getCertificateFiles } from "@/aactions/certificates";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { ids, format = "pdf" } = body;

    if (!Array.isArray(ids) || ids.length === 0) {
      return NextResponse.json(
        { ok: false, error: "Invalid request. Provide an array of ids" },
        { status: 400 },
      );
    }

    if (!["pdf", "jpg", "jpeg"].includes(String(format).toLowerCase())) {
      return NextResponse.json(
        { ok: false, error: "Invalid format. Must be pdf or jpg" },
        { status: 400 },
      );
    }

    const fmt = String(format).toLowerCase();

    const errors: string[] = [];
    const usedFilenames = new Set<string>();
    const zipFiles: Record<string, Uint8Array> = {};
    let successCount = 0;

    const results = await Promise.allSettled(
      ids.map(async (id: string) => {
        try {
          const res = await getCertificateFiles(id, fmt);

          if (!res.ok || !res.data) {
            errors.push(`${id}: ${res.error || "File not found"}`);
            return null;
          }

          return { id, ...res.data };
        } catch (err: unknown) {
          const message = err instanceof Error ? err.message : "Unknown error";
          errors.push(`${id}: ${message}`);
          return null;
        }
      }),
    );

    results.forEach((result) => {
      if (result.status === "fulfilled" && result.value) {
        const { id, fileBuffer, filename } = result.value;

        let finalFilename = filename;
        if (usedFilenames.has(filename)) {
          const parts = filename.split(".");
          const ext = parts.pop();
          const name = parts.join(".");
          finalFilename = `${name}_${id}.${ext}`;
        }
        usedFilenames.add(finalFilename);

        zipFiles[finalFilename] = new Uint8Array(fileBuffer);
        successCount++;
      }
    });

    if (successCount === 0) {
      return NextResponse.json(
        { ok: false, error: "Failed to process any certificates", errors },
        { status: 500 },
      );
    }

    const zipped = zipSync(zipFiles, { level: 6 });

    const zipBuffer = Buffer.from(zipped);

    const headers = new Headers();
    headers.set("Content-Type", "application/zip");
    headers.set(
      "Content-Disposition",
      `attachment; filename="certificates.zip"`,
    );
    headers.set("Cache-Control", "public, max-age=90, immutable");

    if (errors.length > 0) {
      headers.set("X-Partial-Success", "true");
      headers.set("X-Errors", JSON.stringify(errors));
    }

    return new NextResponse(zipBuffer, { headers });
  } catch (err: unknown) {
    const message =
      err instanceof Error ? err.message : "Failed to create zip archive";
    return NextResponse.json({ ok: false, error: message }, { status: 500 });
  }
}
