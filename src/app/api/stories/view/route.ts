export const runtime = "nodejs";

import { NextResponse } from "next/server";
import { markStorySeen } from "@/lib/storyStore";

export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => ({}));
    const storyId = (body?.storyId || "").trim();
    const viewer = (body?.viewer || "").trim();

    if (!storyId || !viewer) {
      return NextResponse.json({ error: "storyId and viewer required" }, { status: 400 });
    }

    await markStorySeen(storyId, viewer);
    return NextResponse.json({ ok: true }, { status: 200 });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Failed to mark story seen" }, { status: 500 });
  }
}
