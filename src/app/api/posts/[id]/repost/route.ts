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

    let didRepost = false;

    const updated = await updatePost(id, (p) => {
      const has = p.reposts.includes(username);
      didRepost = !has;

      return {
        ...p,
        reposts: has ? p.reposts.filter((u) => u !== username) : [...p.reposts, username],
      };
    });

    if (!updated) {
      return NextResponse.json({ error: "Post not found" }, { status: 404 });
    }

    if (didRepost) {
      await addNotification({
        toUser: updated.author,
        fromUser: username,
        type: "repost",
        postId: updated.id,
      });
    }

    return NextResponse.json({ ok: true, reposts: updated.reposts }, { status: 200 });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Failed" }, { status: 500 });
  }
}