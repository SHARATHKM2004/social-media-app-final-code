export const runtime = "nodejs";

import { NextResponse } from "next/server";
import { addStory } from "@/lib/storyStore";

export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => ({}));
    const username = (body?.username || "").trim();
    const mediaDataUrl = (body?.mediaDataUrl || "").trim();

    if (!username || !mediaDataUrl) {
      return NextResponse.json(
        { error: "username and mediaDataUrl required" },
        { status: 400 }
      );
    }

    const story = await addStory(username, mediaDataUrl);
    return NextResponse.json({ ok: true, story }, { status: 200 });
  } catch (e: unknown) {
    const message = e instanceof Error ? e.message : "Failed to upload story";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}