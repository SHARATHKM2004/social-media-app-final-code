import { promises as fs } from "fs";
import path from "path";

export type Post = {
  id: string;
  author: string;
  mediaType: "image" | "video";
  mediaDataUrl: string; // base64 data url (learning)
  caption: string;
  allowComments: boolean;
  allowRepost: boolean;
  createdAt: string;
  likes: string[]; // usernames
  reposts: string[]; // usernames
  comments: { id: string; username: string; text: string; createdAt: string }[];
};

const filePath = path.join(process.cwd(), "src", "data", "posts.json");

/**
 * Simple in-memory cache (server runtime only)
 * - Speeds up repeated reads (GET /api/posts, findPost, etc.)
 * - Invalidate cache whenever data is written
 */
let postsCache: Post[] | null = null;
let postsCacheAt = 0;

// You can tune this (10s–30s is common for demo apps)
const POSTS_CACHE_TTL_MS = 15_000;

export function invalidatePostsCache() {
  postsCache = null;
  postsCacheAt = 0;
}

export async function readPosts(): Promise<Post[]> {
  try {
    // Return cached posts if TTL not expired
    if (postsCache && Date.now() - postsCacheAt < POSTS_CACHE_TTL_MS) {
      return postsCache;
    }

    const data = await fs.readFile(filePath, "utf-8");
    const parsed = JSON.parse(data || "[]") as Post[];

    // Update cache
    postsCache = parsed;
    postsCacheAt = Date.now();

    return parsed;
  } catch {
    // Cache empty list too (avoid repeated disk reads when file missing)
    postsCache = [];
    postsCacheAt = Date.now();
    return [];
  }
}

export async function writePosts(posts: Post[]) {
  await fs.mkdir(path.dirname(filePath), { recursive: true });
  await fs.writeFile(filePath, JSON.stringify(posts, null, 2), "utf-8");

  // Update cache immediately with the latest data
  postsCache = posts;
  postsCacheAt = Date.now();
}

export async function addPost(post: Post) {
  const posts = await readPosts();
  posts.unshift(post); // newest first
  await writePosts(posts);

  // writePosts already updates cache, but keeping invalidation is safe
  // invalidatePostsCache();

  return post;
}

export async function updatePost(postId: string, updater: (p: Post) => Post) {
  const posts = await readPosts();
  const idx = posts.findIndex((p) => p.id === postId);
  if (idx === -1) return null;

  posts[idx] = updater(posts[idx]);
  await writePosts(posts);

  // writePosts already updates cache
  // invalidatePostsCache();

  return posts[idx];
}

export async function findPost(postId: string) {
  const posts = await readPosts();
  return posts.find((p) => p.id === postId) || null;
}

export async function deletePostById(postId: string) {
  const posts = await readPosts();
  const filtered = posts.filter((p) => p.id !== postId);
  await writePosts(filtered);
  if (postsCache && Date.now() - postsCacheAt < POSTS_CACHE_TTL_MS) {
  console.log("[CACHE HIT] readPosts served from memory cache");
  return postsCache;
}

console.log("[CACHE MISS] reading posts from disk");

  // writePosts already updates cache
  // invalidatePostsCache();

  return true;
}