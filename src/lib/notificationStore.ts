import clientPromise from "./mongodb";

export type NotificationType = "like" | "comment" | "repost" | "story_like";

export type NotificationItem = {
  id: string;
  toUser: string;
  fromUser: string;
  type: NotificationType;

  // For post notifications
  postId?: string;

  // For story notifications
  storyId?: string;

  commentText?: string;
  createdAt: string;
  read: boolean;
};

const DB_NAME = "socialApp";
const COLLECTION = "notifications";

function makeId() {
  return `${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

export async function addNotification(
  input: Omit<NotificationItem, "id" | "createdAt" | "read">
) {
  const client = await clientPromise;
  const db = client.db(DB_NAME);

  const doc: NotificationItem = {
    id: makeId(),
    ...input,
    createdAt: new Date().toISOString(),
    read: false,
  };

  // Do not notify yourself
  if ((doc.toUser || "").toLowerCase() === (doc.fromUser || "").toLowerCase()) {
    return null;
  }

  // Must refer to either a post or a story
  if (!doc.postId && !doc.storyId) {
    return null;
  }

  await db.collection(COLLECTION).insertOne(doc);
  return doc;
}

export async function listNotifications(toUser: string, limit = 50) {
  const client = await clientPromise;
  const db = client.db(DB_NAME);

  const u = toUser.trim();

  const items = await db
    .collection(COLLECTION)
    .find({ toUser: { $regex: new RegExp(`^${u}$`, "i") } })
    .sort({ createdAt: -1 })
    .limit(limit)
    .toArray();

  const unreadCount = await db.collection(COLLECTION).countDocuments({
    toUser: { $regex: new RegExp(`^${u}$`, "i") },
    read: false,
  });

  return {
    items: items as unknown as NotificationItem[],
    unreadCount,
  };
}

export async function markAllRead(toUser: string) {
  const client = await clientPromise;
  const db = client.db(DB_NAME);

  const u = toUser.trim();
  await db.collection(COLLECTION).updateMany(
    { toUser: { $regex: new RegExp(`^${u}$`, "i") }, read: false },
    { $set: { read: true } }
  );

  return true;
}

export async function markReadByIds(toUser: string, ids: string[]) {
  const client = await clientPromise;
  const db = client.db(DB_NAME);

  const u = toUser.trim();
  await db.collection(COLLECTION).updateMany(
    { toUser: { $regex: new RegExp(`^${u}$`, "i") }, id: { $in: ids } },
    { $set: { read: true } }
  );

  return true;
}
