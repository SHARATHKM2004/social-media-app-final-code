export const runtime = "nodejs";

import { NextResponse } from "next/server";
import { listActiveStoriesForUser } from "@/lib/storyStore";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const username = (searchParams.get("username") || "").trim();

    if (!username) {
      return NextResponse.json({ error: "username required" }, { status: 400 });
    }

    const stories = await listActiveStoriesForUser(username);
    return NextResponse.json({ ok: true, stories }, { status: 200 });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Failed to load user stories" }, { status: 500 });
  }
}