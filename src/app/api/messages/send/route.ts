export const runtime = "nodejs";

import { NextResponse } from "next/server";
import { addMessage } from "@/lib/messageStore";

function makeId() {
  return `${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { from, to, text } = body as { from: string; to: string; text: string };

    if (!from || !to || !text?.trim()) {
      return NextResponse.json({ error: "from, to, text required" }, { status: 400 });
    }

    const msg = await addMessage({
      id: makeId(),
      from,
      to,
      text: text.trim(),
      createdAt: new Date().toISOString(),
    });

    return NextResponse.json({ ok: true, msg }, { status: 200 });
  } catch {
    return NextResponse.json({ error: "Failed to send message" }, { status: 500 });
  }
}