import clientPromise from "./mongodb";

const DB_NAME = "socialApp";
const LIKES = "storyLikes";

type StoryLikeDoc = {
  storyId: string;
  username: string;
  createdAt: string;
};

export async function getStoryLikeState(storyId: string, username: string) {
  const client = await clientPromise;
  const db = client.db(DB_NAME);

  const u = username.trim();

  const liked = await db.collection<StoryLikeDoc>(LIKES).findOne({
    storyId,
    username: { $regex: new RegExp(`^${u}$`, "i") },
  });

  const likesCount = await db
    .collection(LIKES)
    .countDocuments({ storyId });

  return { liked: !!liked, likesCount };
}

export async function toggleStoryLike(storyId: string, username: string) {
  const client = await clientPromise;
  const db = client.db(DB_NAME);

  const u = username.trim();

  const existing = await db.collection<StoryLikeDoc>(LIKES).findOne({
    storyId,
    username: { $regex: new RegExp(`^${u}$`, "i") },
  });

  let likedNow = false;

  if (existing) {
    // ✅ delete by compound keys (no _id, no any)
    await db.collection(LIKES).deleteOne({
      storyId,
      username: existing.username,
    });
    likedNow = false;
  } else {
    await db.collection(LIKES).insertOne({
      storyId,
      username: u,
      createdAt: new Date().toISOString(),
    });
    likedNow = true;
  }

  const likesCount = await db
    .collection(LIKES)
    .countDocuments({ storyId });

  return { liked: likedNow, likesCount };
}