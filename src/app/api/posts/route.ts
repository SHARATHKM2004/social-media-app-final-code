export const runtime = "nodejs";

import { NextResponse } from "next/server";
import { addPost, readPosts, Post } from "@/lib/postStore";

function id() {
  return `${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const username = (searchParams.get("username") || "").trim();

    const posts = await readPosts();
    const filtered = username
      ? posts.filter((p) => p.author.toLowerCase() === username.toLowerCase())
      : posts;

    return NextResponse.json({ ok: true, posts: filtered }, { status: 200 });
  } catch {
    return NextResponse.json({ ok: false, error: "Failed to load posts" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { author, mediaType, mediaDataUrl, caption, allowComments, allowRepost } = body as {
      author: string;
      mediaType: "image" | "video";
      mediaDataUrl: string;
      caption: string;
      allowComments: boolean;
      allowRepost: boolean;
    };

    if (!author || !mediaType || !mediaDataUrl) {
      return NextResponse.json({ error: "Missing required fields." }, { status: 400 });
    }

    const post: Post = {
      id: id(),
      author,
      mediaType,
      mediaDataUrl,
      caption: caption || "",
      allowComments: !!allowComments,
      allowRepost: !!allowRepost,
      createdAt: new Date().toISOString(),
      likes: [],
      reposts: [],
      comments: [],
    };

    await addPost(post);
    return NextResponse.json({ ok: true, post }, { status: 200 });
  } catch {
    return NextResponse.json({ ok: false, error: "Failed to create post" }, { status: 500 });
  }
}