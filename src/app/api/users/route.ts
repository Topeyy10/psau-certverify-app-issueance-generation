import { NextResponse } from "next/server";
import { getUsers } from "@/aactions/system";

export async function GET(req: Request) {
  try {
    const url = new URL(req.url);

    const pageParam = url.searchParams.get("page");
    const page = pageParam ? Number(pageParam) : 1;
    if (isNaN(page) || page < 1) {
      throw new Error("Page must be a positive number");
    }

    const limitParam = url.searchParams.get("limit");
    const limit = limitParam ? Number(limitParam) : 10;
    if (isNaN(limit) || limit < 1 || limit > 50) {
      throw new Error("Limit must be a number between 1 and 50");
    }

    const sortOrder = url.searchParams.get("order") || "desc";
    if (sortOrder !== "asc" && sortOrder !== "desc") {
      throw new Error("order must be 'asc' or 'desc'");
    }

    const sortBy = url.searchParams.get("sortBy") || "$createdAt";
    if (typeof sortBy !== "string") {
      throw new Error("sortBy must be a string");
    }

    const search = url.searchParams.get("search");
    const role = url.searchParams.get("role") || "any";

    const res = await getUsers(page, limit, search, sortBy, sortOrder, role);
    if (!res.ok) {
      throw new Error(res.error);
    }

    return NextResponse.json(res.data);
  } catch (err: unknown) {
    const errorMessage =
      err instanceof Error ? err.message : "Internal Server Error";
    const status =
      err instanceof Error && errorMessage.includes("must be") ? 400 : 500;

    console.error("GET /api/users failed:", err);
    return NextResponse.json(errorMessage, { status });
  }
}
