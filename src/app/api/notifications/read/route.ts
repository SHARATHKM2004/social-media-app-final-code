export const runtime = "nodejs";

import { NextResponse } from "next/server";
import { markAllRead, markReadByIds } from "@/lib/notificationStore";

export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => ({}));
    const user = (body?.user || "").trim();
    const ids = Array.isArray(body?.ids) ? (body.ids as string[]) : null;

    if (!user) {
      return NextResponse.json({ error: "user required" }, { status: 400 });
    }

    if (ids && ids.length > 0) {
      await markReadByIds(user, ids);
    } else {
      await markAllRead(user);
    }

    return NextResponse.json({ ok: true }, { status: 200 });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Failed to mark read" }, { status: 500 });
  }
}