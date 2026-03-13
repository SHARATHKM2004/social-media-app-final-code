export const runtime = "nodejs";

import { NextResponse } from "next/server";
import { deleteUser } from "@/lib/userStore";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { username } = body as { username: string };

    if (!username) return NextResponse.json({ error: "username required" }, { status: 400 });

    await deleteUser(username);
    return NextResponse.json({ ok: true }, { status: 200 });
  } catch {
    return NextResponse.json({ error: "Something went wrong." }, { status: 500 });
  }
}