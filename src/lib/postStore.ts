import clientPromise from "./mongodb";

export type Post = {
  id: string;
  author: string;
  mediaType: "image" | "video";
  mediaDataUrl: string;
  caption: string;
  allowComments: boolean;
  allowRepost: boolean;
  createdAt: string;
  likes: string[];
  reposts: string[];
  comments: { id: string; username: string; text: string; createdAt: string }[];
};

const DB_NAME = "socialApp";
const COLLECTION = "posts";

// 📥 Get all posts
export async function readPosts(): Promise<Post[]> {
  const client = await clientPromise;
  const db = client.db(DB_NAME);

  const posts = await db
    .collection(COLLECTION)
    .find()
    .sort({ createdAt: -1 }) // newest first
    .toArray();

  return posts as unknown as Post[];
}

// ➕ Add post
export async function addPost(post: Post) {
  const client = await clientPromise;
  const db = client.db(DB_NAME);

  await db.collection(COLLECTION).insertOne(post);
  return post;
}

// 🔍 Find post
export async function findPost(postId: string) {
  const client = await clientPromise;
  const db = client.db(DB_NAME);

  return db.collection(COLLECTION).findOne({ id: postId });
}

// ✏️ Update post
export async function updatePost(postId: string, updater: (p: Post) => Post) {
  const client = await clientPromise;
  const db = client.db(DB_NAME);

  const existing = await db.collection(COLLECTION).findOne({ id: postId });
  if (!existing) return null;

  const updated = updater(existing as unknown as Post);

  await db.collection(COLLECTION).updateOne(
    { id: postId },
    { $set: updated }
  );

  return updated;
}

// ❌ Delete post
export async function deletePostById(postId: string) {
  const client = await clientPromise;
  const db = client.db(DB_NAME);

  await db.collection(COLLECTION).deleteOne({ id: postId });
  return true;
}