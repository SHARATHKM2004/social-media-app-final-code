export const runtime = "nodejs";

import { NextResponse } from "next/server";
import { findUserByUsername, updateUser } from "@/lib/userStore";

function isStrongPassword(password: string) {
  const regex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9]).{8,}$/;
  return regex.test(password);
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { username, currentPassword, newPassword } = body as {
      username: string;
      currentPassword: string;
      newPassword: string;
    };

    if (!username || !currentPassword || !newPassword) {
      return NextResponse.json({ error: "All fields are required." }, { status: 400 });
    }

    if (!isStrongPassword(newPassword)) {
      return NextResponse.json(
        { error: "New password must be 8+ chars with uppercase, lowercase, number, symbol." },
        { status: 400 }
      );
    }

    const user = await findUserByUsername(username);
    if (!user || user.password !== currentPassword) {
      return NextResponse.json({ error: "Current password is incorrect." }, { status: 401 });
    }

    await updateUser(username, { password: newPassword });
    return NextResponse.json({ ok: true }, { status: 200 });
  } catch {
    return NextResponse.json({ error: "Something went wrong." }, { status: 500 });
  }
}