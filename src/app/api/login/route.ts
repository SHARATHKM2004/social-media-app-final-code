import { NextResponse } from "next/server";
import { findUserByUsername } from "@/lib/userStore";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { username, password } = body;

    if (!username || !password) {
      return NextResponse.json({ error: "Username and password are required." }, { status: 400 });
    }

    const user = await findUserByUsername(username);
    if (!user) {
      return NextResponse.json({ error: "Invalid username or password." }, { status: 401 });
    }

    if (user.password !== password) {
      return NextResponse.json({ error: "Invalid username or password." }, { status: 401 });
    }

    return NextResponse.json({ ok: true, username }, { status: 200 });
  } catch {
    return NextResponse.json({ error: "Something went wrong." }, { status: 500 });
  }
}