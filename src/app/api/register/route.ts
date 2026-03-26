export const runtime = "nodejs";

import { NextResponse } from "next/server";
import { addUser, findUserByEmail, findUserByUsername } from "@/lib/userStore";
import { hashPassword } from "@/lib/password";
function isStrongPassword(password: string) {
  // At least 8, one uppercase, one lowercase, one number, one symbol
  const regex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9]).{8,}$/;
  return regex.test(password);
}

export async function POST(req: Request) {
  try {
    const body = await req.json();

const { password, username: rawUsername, email: rawEmail } = body as {
  username: string;
  email: string;
  password: string;
};

let username = rawUsername;
let email = rawEmail;


    if (!username || !email || !password) {
      return NextResponse.json({ error: "All fields are required." }, { status: 400 });
    }

    username = username.trim();
    email = email.trim().toLowerCase();

    if (!isStrongPassword(password)) {
      return NextResponse.json(
        { error: "Password must be at least 8 characters and include uppercase, lowercase, number, and symbol." },
        { status: 400 }
      );
    }

    const existingUser = await findUserByUsername(username);
    if (existingUser) {
      return NextResponse.json({ error: "Username already exists." }, { status: 409 });
    }

    const existingEmail = await findUserByEmail(email);
    if (existingEmail) {
      return NextResponse.json({ error: "Email already exists." }, { status: 409 });
    }
const hashed = await hashPassword(password);
    await addUser({
      username,
      email,
      password:hashed,
      createdAt: new Date().toISOString(),
    });

    return NextResponse.json({ ok: true, username }, { status: 200 });
  } catch {
    return NextResponse.json({ error: "Something went wrong." }, { status: 500 });
  }
}