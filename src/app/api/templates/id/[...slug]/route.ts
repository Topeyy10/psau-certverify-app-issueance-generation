import { NextResponse } from "next/server";
import { getTemplate } from "@/aactions/template/get-template";

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
    const res = await getTemplate(fileId);

    if (!res.ok) {
      throw new Error(res.error);
    }

    return new NextResponse(JSON.stringify(res.data), {
      headers: {
        "Content-Type": "application/json",
        "Cache-Control": "public, max-age=300, immutable", // Cache for 5 min
      },
    });
  } catch (err: unknown) {
    const message =
      err instanceof Error ? err.message : "Internal server error";

    return NextResponse.json(message, { status: 500 });
  }
}
