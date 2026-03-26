export const runtime = "nodejs";

import { NextResponse } from "next/server";
import { getThreadsForUser } from "@/lib/messageStore";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const user = (searchParams.get("user") || "").trim();

    if (!user) return NextResponse.json({ error: "user required" }, { status: 400 });

    const threads = await getThreadsForUser(user);
    return NextResponse.json({ ok: true, threads }, { status: 200 });
  } catch {
    return NextResponse.json({ error: "Failed to load threads" }, { status: 500 });
  }
}