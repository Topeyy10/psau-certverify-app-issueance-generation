import { NextResponse } from "next/server";
import { getLoggedInUser } from "@/aactions/auth";
import { getLogs } from "@/aactions/system/";

export async function GET(req: Request) {
  try {
    const url = new URL(req.url);

    // Step 1: Verify current user session
    const currentUser = await getLoggedInUser();
    if (!currentUser) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Step 2: Verify role
    if (!currentUser.labels.includes("admin")) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    // Step 3: Validate and parse query parameters
    const page = Number(url.searchParams.get("page") ?? 1);
    const limit = Number(url.searchParams.get("limit") ?? 20);
    const sortBy = url.searchParams.get("sortBy") ?? "$createdAt";
    const order = (url.searchParams.get("order") ?? "desc") as "asc" | "desc";

    if (!Number.isFinite(page) || page < 1) {
      return NextResponse.json(
        { error: "Page must be a positive number" },
        { status: 400 },
      );
    }

    if (!Number.isFinite(limit) || limit < 1 || limit > 50) {
      return NextResponse.json(
        { error: "Limit must be between 1 and 50" },
        { status: 400 },
      );
    }

    if (order !== "asc" && order !== "desc") {
      return NextResponse.json(
        { error: "Order must be 'asc' or 'desc'" },
        { status: 400 },
      );
    }

    // Step 4: Fetch logs using the authenticated session
    const res = await getLogs(page, limit, sortBy, order);

    if (!res.ok) {
      throw new Error(res.error);
    }

    // Step 5: Respond with data
    return NextResponse.json(res.data, { status: 200 });
  } catch (err: unknown) {
    const message =
      err instanceof Error ? err.message : "Internal Server Error";
    console.error("GET /api/logs failed:", err);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
