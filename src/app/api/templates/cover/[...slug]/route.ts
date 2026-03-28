import { NextResponse } from "next/server";
import { getTemplateCover } from "@/aactions/template";

export async function GET(
  request: Request,
  context: { params: Promise<{ slug: string[] }> },
) {
  try {
    const params = await context.params;
    const slug = params.slug ?? [];

    if (slug.length === 0) {
      throw new Error("Missing fileId slug");
    }

    const fileId = slug[0];
    const res = await getTemplateCover(fileId);

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
    return NextResponse.json(message, { status: 400 });
  }
}
