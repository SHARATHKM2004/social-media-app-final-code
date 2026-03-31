export const runtime = "nodejs";

import { NextResponse } from "next/server";
import { listNotifications } from "@/lib/notificationStore";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const user = (searchParams.get("user") || "").trim();
    const limitRaw = searchParams.get("limit") || "50";
    const limit = Math.min(Math.max(parseInt(limitRaw, 10) || 50, 1), 200);

    if (!user) {
      return NextResponse.json({ error: "user required" }, { status: 400 });
    }

    const { items, unreadCount } = await listNotifications(user, limit);

    return NextResponse.json({ ok: true, items, unreadCount }, { status: 200 });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Failed to load notifications" }, { status: 500 });
  }
}