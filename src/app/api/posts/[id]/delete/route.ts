export const runtime = "nodejs";

import { NextResponse } from "next/server";
import { deletePostById, readPosts } from "@/lib/postStore";

export async function POST(req: Request, ctx: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await ctx.params;
    const body = await req.json();
    const { username } = body as { username: string };

    if (!username) {
      return NextResponse.json({ error: "username required" }, { status: 400 });
    }

    // ✅ Ensure only author can delete
    const posts = await readPosts();
    const post = posts.find((p) => p.id === id);

    if (!post) {
      return NextResponse.json({ error: "Post not found" }, { status: 404 });
    }

    if (post.author.toLowerCase() !== username.toLowerCase()) {
      return NextResponse.json({ error: "Not allowed" }, { status: 403 });
    }

    await deletePostById(id);
    return NextResponse.json({ ok: true }, { status: 200 });
  } catch {
    return NextResponse.json({ error: "Failed to delete post" }, { status: 500 });
  }
}