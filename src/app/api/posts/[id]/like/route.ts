export const runtime = "nodejs";

import { NextResponse } from "next/server";
import { updatePost } from "@/lib/postStore";

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }   // ✅ FIX
) {
  try {
    const { id } = await params;   // ✅ VERY IMPORTANT FIX

    const body = await req.json();
    const username = body?.username?.trim();

    if (!username) {
      return NextResponse.json(
        { error: "username required" },
        { status: 400 }
      );
    }

    const updated = await updatePost(id, (p) => {
      const has = p.likes.includes(username);
      return {
        ...p,
        likes: has
          ? p.likes.filter((u) => u !== username)
          : [...p.likes, username],
      };
    });

    if (!updated) {
      return NextResponse.json(
        { error: "Post not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(
      { ok: true, likes: updated.likes },
      { status: 200 }
    );
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Failed" }, { status: 500 });
  }
}