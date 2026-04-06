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

    const username = (searchParams.get("username") || "").trim();

    const pageParam = parseInt(searchParams.get("page") || "1", 10);
    const limitParam = parseInt(searchParams.get("limit") || "10", 10);

    // ✅ NEW: includeMedia flag (default ON)
    // profile will call includeMedia=0 to avoid base64 payload
    const includeMediaParam = (searchParams.get("includeMedia") || "1").trim();
    const includeMedia = includeMediaParam !== "0";

    const page = Number.isFinite(pageParam) && pageParam > 0 ? pageParam : 1;
    const limit =
      Number.isFinite(limitParam) && limitParam > 0 && limitParam <= 100 ? limitParam : 10;

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

    // ✅ Enrich each post with author avatar
    // ✅ If includeMedia=0, strip base64 to reduce payload
    const enriched = await Promise.all(
      paginated.map(async (p) => {
        const u = await findUserByUsername(p.author);
        const authorAvatarDataUrl = (u as any)?.avatarDataUrl || "";

        if (includeMedia) {
          return {
            ...p,
            authorAvatarDataUrl,
          };
        }

        // ✅ payload-optimized version (no mediaDataUrl)
        // Keep metadata so UI can fetch media via /api/media/post/:id
        // Note: mediaType remains, id remains.
        const { mediaDataUrl, ...rest } = p as any;

        return {
          ...rest,
          authorAvatarDataUrl,
          hasMedia: !!mediaDataUrl,
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
          // If media not included, allow a bit longer cache (still private)
          "Cache-Control": includeMedia ? "private, max-age=10" : "private, max-age=30",
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
