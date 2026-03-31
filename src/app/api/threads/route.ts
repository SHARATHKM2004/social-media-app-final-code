export const runtime = "nodejs";

import { NextResponse } from "next/server";
import { getThreadsForUser } from "@/lib/messageStore";
import { findUserByUsername } from "@/lib/userStore";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const user = (searchParams.get("user") || "").trim();

    if (!user) {
      return NextResponse.json({ error: "user required" }, { status: 400 });
    }

    const threads = await getThreadsForUser(user);

    // ✅ Attach avatarDataUrl for each user
    const enriched = await Promise.all(
      threads.map(async (t) => {
        const u = await findUserByUsername(t.withUser);
        return {
          ...t,
          avatarDataUrl: u?.avatarDataUrl || "",
        };
      })
    );

    return NextResponse.json({ ok: true, threads: enriched }, { status: 200 });
  } catch (e) {
    console.error(e);
    return NextResponse.json(
      { error: "Failed to load threads" },
      { status: 500 }
    );
  }
}
