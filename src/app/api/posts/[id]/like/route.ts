export const runtime = "nodejs";

import { NextResponse } from "next/server";
import { updatePost } from "@/lib/postStore";
import { addNotification } from "@/lib/notificationStore";

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const body = await req.json();
    const username = body?.username?.trim();

    if (!username) {
      return NextResponse.json({ error: "username required" }, { status: 400 });
    }

    let didLike = false;

    const updated = await updatePost(id, (p) => {
      const has = p.likes.includes(username);
      didLike = !has;

      return {
        ...p,
        likes: has ? p.likes.filter((u) => u !== username) : [...p.likes, username],
      };
    });

    if (!updated) {
      return NextResponse.json({ error: "Post not found" }, { status: 404 });
    }

    // ✅ Create notification only when user newly liked
    if (didLike) {
      await addNotification({
        toUser: updated.author,
        fromUser: username,
        type: "like",
        postId: updated.id,
      });
    }

    return NextResponse.json({ ok: true, likes: updated.likes }, { status: 200 });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Failed" }, { status: 500 });
  }
}