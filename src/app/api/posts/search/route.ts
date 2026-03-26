export const runtime = "nodejs";

import { NextResponse } from "next/server";
import { readPosts } from "@/lib/postStore";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const q = (searchParams.get("q") || "").trim().toLowerCase();

    if (!q) {
      return NextResponse.json({ ok: true, posts: [] }, { status: 200 });
    }

    const posts = await readPosts();

    // Search by caption OR author
    const matched = posts
      .filter((p) => {
        const caption = (p.caption || "").toLowerCase();
        const author = (p.author || "").toLowerCase();
        return caption.includes(q) || author.includes(q);
      })
      .slice(0, 20)
      .map((p) => ({
        id: p.id,
        author: p.author,
        caption: p.caption,
        mediaType: p.mediaType,
        mediaDataUrl: p.mediaDataUrl,
        createdAt: p.createdAt,
        likesCount: p.likes.length,
        commentsCount: p.comments.length,
      }));

    return NextResponse.json({ ok: true, posts: matched }, { status: 200 });
  } catch {
    return NextResponse.json({ ok: false, error: "Failed to search posts" }, { status: 500 });
  }
}