export const runtime = "nodejs";

import { NextResponse } from "next/server";
import { markConversationRead } from "@/lib/messageStore";

export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => ({}));
    const reader = (body?.reader || "").trim();
    const withUser = (body?.withUser || "").trim();

    if (!reader || !withUser) {
      return NextResponse.json({ error: "reader and withUser required" }, { status: 400 });
    }

    await markConversationRead(reader, withUser);
    return NextResponse.json({ ok: true }, { status: 200 });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Failed to mark read" }, { status: 500 });
  }
}
