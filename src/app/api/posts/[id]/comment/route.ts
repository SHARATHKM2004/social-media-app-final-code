export const runtime = "nodejs";

import { NextResponse } from "next/server";
import { updatePost } from "@/lib/postStore";

function id() {
  return `${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }   // ✅ FIX
) {
  try {
    const { id: postId } = await params;   // ✅ FIX

    const body = await req.json();

    const username = body?.username?.trim();
    const text = body?.text?.trim();

    if (!username || !text) {
      return NextResponse.json(
        { error: "username and comment text required" },
        { status: 400 }
      );
    }

    const updated = await updatePost(postId, (p) => {
      if (!p.allowComments) return p;

      const newComment = {
        id: id(),
        username,
        text,
        createdAt: new Date().toISOString(),
      };

      return {
        ...p,
        comments: [...p.comments, newComment],
      };
    });

    if (!updated) {
      return NextResponse.json(
        { error: "Post not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(
      { ok: true, comments: updated.comments },
      { status: 200 }
    );
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Failed" }, { status: 500 });
  }
}