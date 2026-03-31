export const runtime = "nodejs";

import { NextResponse } from "next/server";
import { countUnreadForUser } from "@/lib/messageStore";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const user = (searchParams.get("user") || "").trim();

    if (!user) {
      return NextResponse.json({ error: "user required" }, { status: 400 });
    }

    const unreadCount = await countUnreadForUser(user);
    return NextResponse.json({ ok: true, unreadCount }, { status: 200 });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Failed to load unread count" }, { status: 500 });
  }
}
