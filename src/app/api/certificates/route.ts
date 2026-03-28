import { NextResponse } from "next/server";
import { getCertificates } from "@/aactions/certificates";

export async function GET(req: Request) {
  try {
    const url = new URL(req.url);

    // Parse and validate page
    const pageParam = url.searchParams.get("page");
    const page = pageParam ? Number(pageParam) : 1;
    if (isNaN(page) || page < 1) {
      throw new Error("Page must be a positive number");
    }

    // Parse and validate limit
    const limitParam = url.searchParams.get("limit");
    const limit = limitParam ? Number(limitParam) : 10;
    if (isNaN(limit) || limit < 1 || limit > 50) {
      throw new Error("Limit must be a number between 1 and 50");
    }

    // Parse and validate sortOrder
    const sortOrder = url.searchParams.get("order") || "desc";
    if (sortOrder !== "asc" && sortOrder !== "desc") {
      throw new Error("order must be 'asc' or 'desc'");
    }

    // Parse sortBy
    const sortBy = url.searchParams.get("sortBy") || "$createdAt";
    if (typeof sortBy !== "string") {
      throw new Error("sortBy must be a string");
    }

    // Parse search (optional, can be null)
    const search = url.searchParams.get("search");
    const status = url.searchParams.get("status") || "any";

    // Fetch certificates
    const res = await getCertificates(
      page,
      limit,
      search,
      sortBy,
      sortOrder,
      status,
    );
    if (!res.ok) {
      throw new Error(res.error);
    }

    return NextResponse.json(res.data);
  } catch (err: unknown) {
    const errorMessage =
      err instanceof Error ? err.message : "Internal Server Error";
    // Use 400 for validation errors (thrown explicitly) and 500 for unexpected errors
    const status =
      err instanceof Error && errorMessage.includes("must be") ? 400 : 500;

    console.error("GET /api/certificates failed:", err);
    return NextResponse.json(errorMessage, { status });
  }
}
