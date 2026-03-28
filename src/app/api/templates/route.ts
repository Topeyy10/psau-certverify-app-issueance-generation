import { NextResponse } from "next/server";
import { getUserTemplates } from "@/aactions/template";

export async function GET(request: Request) {
  try {
    // Extract query parameters
    const { searchParams } = new URL(request.url);
    const searchTerm = searchParams.get("searchTerm") || "";
    const pageRaw = searchParams.get("page");
    const page = parseInt(pageRaw || "1", 10);
    const limitRaw = searchParams.get("limit");
    const limit = parseInt(limitRaw || "10", 10);
    const refresh = searchParams.get("refresh") === "true";

    // Validate parameters
    if (isNaN(page) || page < 1) {
      throw new Error(`Invalid page number [${pageRaw}]`);
    }
    if (isNaN(limit) || limit < 1 || limit > 100) {
      throw new Error(`Invalid limit (must be 1-100) [${limitRaw}]`);
    }

    // Call getUserTemplates
    const res = await getUserTemplates(searchTerm, page, limit, refresh);
    if (!res.ok) {
      throw new Error(res.error);
    }

    return NextResponse.json(res.data, { status: 200 });
  } catch (err: unknown) {
    const message =
      err instanceof Error ? err.message : "Internal server error";
    return NextResponse.json(message, { status: 500 });
  }
}
