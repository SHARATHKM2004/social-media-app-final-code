import { NextResponse } from "next/server";
import { findUserByUsername } from "@/lib/userStore";
import { verifyPassword } from "@/lib/password";
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

   const ok = await verifyPassword(password, user.password);
if (!ok) return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });

    return NextResponse.json({ ok: true, username }, { status: 200 });
  } catch {
    return NextResponse.json({ error: "Something went wrong." }, { status: 500 });
  }
}