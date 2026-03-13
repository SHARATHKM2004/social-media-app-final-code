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

export async function readPosts(): Promise<Post[]> {
  try {
    const data = await fs.readFile(filePath, "utf-8");
    return JSON.parse(data || "[]") as Post[];
  } catch {
    return [];
  }
}

export async function writePosts(posts: Post[]) {
  await fs.mkdir(path.dirname(filePath), { recursive: true });
  await fs.writeFile(filePath, JSON.stringify(posts, null, 2), "utf-8");
}

export async function addPost(post: Post) {
  const posts = await readPosts();
  posts.unshift(post); // newest first
  await writePosts(posts);
  return post;
}

export async function updatePost(postId: string, updater: (p: Post) => Post) {
  const posts = await readPosts();
  const idx = posts.findIndex((p) => p.id === postId);
  if (idx === -1) return null;
  posts[idx] = updater(posts[idx]);
  await writePosts(posts);
  return posts[idx];
}

export async function findPost(postId: string) {
  const posts = await readPosts();
  return posts.find((p) => p.id === postId) || null;
}