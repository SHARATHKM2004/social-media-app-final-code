export const runtime = "nodejs";

import { NextResponse } from "next/server";
import { getStoriesTray } from "@/lib/storyStore";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const viewer = (searchParams.get("viewer") || "").trim();

    const items = await getStoriesTray(viewer, 20);
    return NextResponse.json({ ok: true, items }, { status: 200 });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Failed to load stories tray" }, { status: 500 });
  }
}
