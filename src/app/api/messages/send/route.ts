export const runtime = "nodejs";

import { NextResponse } from "next/server";
import { addMessage, ChatAttachment } from "@/lib/messageStore";

function makeId() {
  return `${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => ({}));
    const from = (body?.from || "").trim();
    const to = (body?.to || "").trim();
    const text = String(body?.text || "").trim();
    const attachments = Array.isArray(body?.attachments) ? (body.attachments as ChatAttachment[]) : [];

    if (!from || !to) {
      return NextResponse.json({ error: "from and to required" }, { status: 400 });
    }

    // allow: text-only OR attachments-only OR both
    if (!text && attachments.length === 0) {
      return NextResponse.json({ error: "text or attachments required" }, { status: 400 });
    }

    // basic safety: limit attachments count
    if (attachments.length > 3) {
      return NextResponse.json({ error: "Max 3 attachments allowed" }, { status: 400 });
    }

    const msg = await addMessage({
      id: makeId(),
      from,
      to,
      text,
      attachments,
      createdAt: new Date().toISOString(),
      read: false,
    });

    return NextResponse.json({ ok: true, msg }, { status: 200 });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Failed to send message" }, { status: 500 });
  }
}