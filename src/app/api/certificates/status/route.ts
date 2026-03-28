import { type NextRequest, NextResponse } from "next/server";
import { getLoggedInUser } from "@/aactions/auth";
import { updateCertificateStatus } from "@/aactions/certificates";

export async function PATCH(req: NextRequest) {
  try {
    const body = await req.json();
    const { ids, status } = body as {
      ids?: string[];
      status?: string;
    };

    if (!Array.isArray(ids) || ids.length === 0 || status === undefined) {
      return NextResponse.json(
        { ok: false, error: "Invalid request: ids and status required" },
        { status: 400 },
      );
    }

    const currentUser = await getLoggedInUser();
    if (!currentUser) {
      return NextResponse.json({ ok: false, error: "No session" }, { status: 401 });
    }

    const errorList: string[] = [];
    let updated = 0;

    for (const id of ids) {
      const res = await updateCertificateStatus(status as "0" | "1" | "-1", id);
      if (res.ok) {
        updated++;
      } else {
        errorList.push(id);
      }
    }

    return NextResponse.json({
      ok: true,
      updated,
      errorList,
    });
  } catch (err: unknown) {
    const message =
      err instanceof Error ? err.message : "Failed to update certificate status";
    return NextResponse.json({ ok: false, error: message }, { status: 500 });
  }
}
