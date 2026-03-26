export const runtime = "nodejs";

import { NextResponse } from "next/server";
import { findUserByUsername, updateUser } from "@/lib/userStore";
import bcrypt from "bcryptjs";

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
    if (!user) {
      return NextResponse.json({ error: "User not found." }, { status: 404 });
    }

    // ✅ Compare current password with stored hash
    const ok = await bcrypt.compare(currentPassword, user.password);
    if (!ok) {
      return NextResponse.json({ error: "Current password is incorrect." }, { status: 401 });
    }

    // ✅ Hash new password before saving
    const hashed = await bcrypt.hash(newPassword, 10);

    await updateUser(username, { password: hashed });
    return NextResponse.json({ ok: true }, { status: 200 });
  } catch {
    return NextResponse.json({ error: "Something went wrong." }, { status: 500 });
  }
}