export const runtime = "nodejs";

import { NextResponse } from "next/server";
import { addPost, readPosts, Post } from "@/lib/postStore";
import { findUserByUsername } from "@/lib/userStore";

function id() {
  return `${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

// 📥 GET POSTS
export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);

    const username = searchParams.get("username")?.trim() || "";

    const pageParam = parseInt(searchParams.get("page") || "1", 10);
    const limitParam = parseInt(searchParams.get("limit") || "10", 10);

    const page = Number.isFinite(pageParam) && pageParam > 0 ? pageParam : 1;
    const limit =
      Number.isFinite(limitParam) && limitParam > 0 && limitParam <= 100
        ? limitParam
        : 10;

    const posts = await readPosts();

    // 🔍 Filter by user (optional)
    const filtered = username
      ? posts.filter((p) => p.author.toLowerCase() === username.toLowerCase())
      : posts;

    // 📄 Pagination
    const total = filtered.length;
    const start = (page - 1) * limit;
    const end = start + limit;

    const paginated = filtered.slice(start, end);
    const hasMore = end < total;

    // ✅ Enrich each post with author avatar (limit is small, so N lookups is ok)
    const enriched = await Promise.all(
      paginated.map(async (p) => {
        const u = await findUserByUsername(p.author);
        return {
          ...p,
          authorAvatarDataUrl: (u as any)?.avatarDataUrl || "",
        };
      })
    );
    
    return NextResponse.json(
      {
        ok: true,
        posts: enriched,
        page,
        limit,
        total,
        hasMore,
      },
      {
        status: 200,
        headers: {
          "Cache-Control": "private, max-age=10",
        },
      }
    );
  } catch (err) {
    console.error(err);
    return NextResponse.json({ ok: false, error: "Failed to load posts" }, { status: 500 });
  }
}

// ➕ CREATE POST
export async function POST(req: Request) {
  try {
    const body = await req.json();

    const { author, mediaType, mediaDataUrl, caption, allowComments, allowRepost } = body as {
      author: string;
      mediaType: "image" | "video";
      mediaDataUrl: string;
      caption?: string;
      allowComments?: boolean;
      allowRepost?: boolean;
    };

    if (!author || !mediaType || !mediaDataUrl) {
      return NextResponse.json({ error: "Missing required fields." }, { status: 400 });
    }

    const post: Post = {
      id: id(),
      author: author.trim(),
      mediaType,
      mediaDataUrl,
      caption: caption?.trim() || "",
      allowComments: !!allowComments,
      allowRepost: !!allowRepost,
      createdAt: new Date().toISOString(),
      likes: [],
      reposts: [],
      comments: [],
    };

    await addPost(post);

    // ✅ Include author avatar in response too (helps UI update immediately after creation)
    const u = await findUserByUsername(post.author);
    const enriched = {
      ...post,
      authorAvatarDataUrl: (u as any)?.avatarDataUrl || "",
    };

    return NextResponse.json({ ok: true, post: enriched }, { status: 200 });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ ok: false, error: "Failed to create post" }, { status: 500 });
  }
}
