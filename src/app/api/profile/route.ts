export const runtime = "nodejs";

import { NextResponse } from "next/server";
import { findUserByUsername, updateUser } from "@/lib/userStore";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { username } = body as { username: string };

    if (!username) return NextResponse.json({ error: "username required" }, { status: 400 });

    const user = await findUserByUsername(username);
    if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 });

    return NextResponse.json(
      {
        ok: true,
        profile: {
          username: user.username,
          pronoun: user.pronoun || "",
          bio: user.bio || "",
          avatarDataUrl: user.avatarDataUrl || "",
        },
      },
      { status: 200 }
    );
  } catch {
    return NextResponse.json({ error: "Something went wrong." }, { status: 500 });
  }
}

export async function PUT(req: Request) {
  try {
    const body = await req.json();
    const { username, pronoun, bio, avatarDataUrl } = body as {
      username: string;
      pronoun?: string;
      bio?: string;
      avatarDataUrl?: string;
    };

    if (!username) return NextResponse.json({ error: "username required" }, { status: 400 });

    const updated = await updateUser(username, {
      pronoun: pronoun ?? "",
      bio: bio ?? "",
      avatarDataUrl: avatarDataUrl ?? "",
    });

    if (!updated) return NextResponse.json({ error: "User not found" }, { status: 404 });

    return NextResponse.json({ ok: true }, { status: 200 });
  } catch {
    return NextResponse.json({ error: "Something went wrong." }, { status: 500 });
  }
}