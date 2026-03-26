export const runtime = "nodejs";

import { NextResponse } from "next/server";
import { getConversation } from "@/lib/messageStore";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const userA = (searchParams.get("userA") || "").trim();
    const userB = (searchParams.get("userB") || "").trim();

    if (!userA || !userB) {
      return NextResponse.json({ error: "userA and userB required" }, { status: 400 });
    }

    const messages = await getConversation(userA, userB);
    return NextResponse.json({ ok: true, messages }, { status: 200 });
  } catch {
    return NextResponse.json({ error: "Failed to load messages" }, { status: 500 });
  }
}