export const runtime = "nodejs";

import { NextResponse } from "next/server";
import { readUsers } from "@/lib/userStore";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const q = (searchParams.get("q") || "").trim().toLowerCase();

    const users = await readUsers();

    if (!q) {
      return NextResponse.json({ ok: true, users: [] }, { status: 200 });
    }

    const matched = users
      .filter((u) => u.username.toLowerCase().includes(q))
      .slice(0, 20)
      .map((u) => ({
        username: u.username,
        avatarDataUrl: u.avatarDataUrl || "",
      }));

    return NextResponse.json({ ok: true, users: matched }, { status: 200 });
  } catch {
    return NextResponse.json({ error: "Something went wrong." }, { status: 500 });
  }
}
