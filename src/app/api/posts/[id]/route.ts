export const runtime = "nodejs";

import { NextResponse } from "next/server";
import { readPosts } from "@/lib/postStore";

export async function GET(req: Request, ctx: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await ctx.params;

    // ✅ decode the id from URL
    const decodedId = decodeURIComponent(id);

    const posts = await readPosts();
    const post = posts.find((p) => p.id === decodedId);

    if (!post) return NextResponse.json({ error: "Post not found" }, { status: 404 });

    return NextResponse.json({ ok: true, post }, { status: 200 });
  } catch {
    return NextResponse.json({ error: "Failed" }, { status: 500 });
  }
}