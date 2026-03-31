import { MongoClient } from "mongodb";

export type AttachmentKind = "image" | "video" | "file";

export type ChatAttachment = {
  kind: AttachmentKind;
  name: string;
  mime: string;
  size: number;
  dataUrl: string; // base64 for now
};

export type ChatMessage = {
  id: string;
  from: string;
  to: string;
  text: string;
  createdAt: string;

  // ✅ read/unread
  read: boolean;
  readAt?: string;

  // ✅ attachments
  attachments?: ChatAttachment[];
};

type MessageDoc = ChatMessage & {
  fromLower: string;
  toLower: string;
};

const uri = process.env.MONGODB_URI;

if (!uri) {
  throw new Error("Missing MONGODB_URI in environment variables");
}

let clientPromise: Promise<MongoClient>;

declare global {
  // eslint-disable-next-line no-var
  var _mongoClientPromise: Promise<MongoClient> | undefined;
}

if (process.env.NODE_ENV === "development") {
  if (!global._mongoClientPromise) {
    const client = new MongoClient(uri);
    global._mongoClientPromise = client.connect();
  }
  clientPromise = global._mongoClientPromise!;
} else {
  const client = new MongoClient(uri);
  clientPromise = client.connect();
}

async function getDb() {
  const client = await clientPromise;
  // If you already use a DB name elsewhere, replace "social_app" with that same DB name
  return client.db(process.env.MONGODB_DB || "social_app");
}

async function ensureIndexes() {
  const db = await getDb();
  const col = db.collection<MessageDoc>("messages");

  await col.createIndex({ fromLower: 1, toLower: 1, createdAt: 1 });
  await col.createIndex({ toLower: 1, createdAt: -1 });

  // ✅ unread lookups
  await col.createIndex({ toLower: 1, read: 1, createdAt: -1 });
  await col.createIndex({ fromLower: 1, toLower: 1, read: 1 });
}

export async function addMessage(msg: Omit<ChatMessage, "read"> & { read?: boolean }) {
  await ensureIndexes();

  const db = await getDb();
  const col = db.collection<MessageDoc>("messages");

  const doc: MessageDoc = {
    ...msg,
    read: typeof msg.read === "boolean" ? msg.read : false,
    fromLower: msg.from.toLowerCase(),
    toLower: msg.to.toLowerCase(),
  };

  await col.insertOne(doc);
  return doc as ChatMessage;
}

export async function getConversation(userA: string, userB: string) {
  await ensureIndexes();

  const db = await getDb();
  const col = db.collection<MessageDoc>("messages");

  const a = userA.trim().toLowerCase();
  const b = userB.trim().toLowerCase();

  const list = await col
    .find({
      $or: [
        { fromLower: a, toLower: b },
        { fromLower: b, toLower: a },
      ],
    })
    .sort({ createdAt: 1 })
    .project({ _id: 0, fromLower: 0, toLower: 0 })
    .toArray();

  // Backward compatibility: old messages may not have read field
  return (list as unknown as ChatMessage[]).map((m) => ({
    ...m,
    read: typeof m.read === "boolean" ? m.read : false,
  }));
}

// ✅ Mark all messages as read where: to=reader and from=withUser
export async function markConversationRead(reader: string, withUser: string) {
  await ensureIndexes();

  const db = await getDb();
  const col = db.collection<MessageDoc>("messages");

  const r = reader.trim().toLowerCase();
  const w = withUser.trim().toLowerCase();

  const now = new Date().toISOString();

  await col.updateMany(
    {
      toLower: r,
      fromLower: w,
      $or: [{ read: false }, { read: { $exists: false } }],
    },
    { $set: { read: true, readAt: now } }
  );

  return true;
}

// ✅ Count all unread messages for user
export async function countUnreadForUser(user: string) {
  await ensureIndexes();
  const db = await getDb();
  const col = db.collection<MessageDoc>("messages");

  const u = user.trim().toLowerCase();

  const users = await col.distinct("fromLower", {
    toLower: u,
    $or: [{ read: false }, { read: { $exists: false } }],
  });

  return users.length;
}


export async function getThreadsForUser(user: string) {
  await ensureIndexes();

  const db = await getDb();
  const col = db.collection<MessageDoc>("messages");

  const u = user.trim().toLowerCase();

  // ✅ 1. Count unread messages PER USER (sender -> count)
  const unreadAgg = await col
    .aggregate<{ _id: string; count: number }>([
      {
        $match: {
          toLower: u,
          $or: [{ read: false }, { read: { $exists: false } }],
        },
      },
      {
        $group: {
          _id: "$fromLower",
          count: { $sum: 1 },
        },
      },
    ])
    .toArray();

  const unreadMap = new Map<string, number>();
  for (const r of unreadAgg) {
    unreadMap.set(r._id, r.count);
  }

  // ✅ 2. Get latest messages first (this controls thread order)
  const msgs = await col
    .find({ $or: [{ fromLower: u }, { toLower: u }] })
    .sort({ createdAt: -1 }) // ✅ newest first
    .project({ _id: 0, fromLower: 0, toLower: 0 })
    .toArray();

  // ✅ 3. Pick only latest message per user
  const map = new Map<string, ChatMessage>();

  for (const m of msgs as unknown as ChatMessage[]) {
    const other = m.from.toLowerCase() === u ? m.to : m.from;
    const key = other.toLowerCase();

    if (!map.has(key)) {
      map.set(key, m); // first occurrence is newest
    }
  }

  // ✅ 4. Build final threads list
  const threads = Array.from(map.entries()).map(([otherLower, m]) => ({
    withUser: m.from.toLowerCase() === u ? m.to : m.from,
    lastMessage: m.text || (m.attachments?.length ? "📎 Attachment" : ""),
    updatedAt: m.createdAt,
    unreadCount: unreadMap.get(otherLower) || 0, // ✅ per-user unread count
  }));

  // ✅ 5. Ensure sorted by latest activity (WhatsApp style)
  threads.sort(
    (a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
  );

  return threads;
}