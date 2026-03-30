import { MongoClient } from "mongodb";

export type ChatMessage = {
  id: string;
  from: string;
  to: string;
  text: string;
  createdAt: string;
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

// Reuse connection in dev/hot-reload
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
  const db = client.db(process.env.MONGODB_DB || "social_app");
  return db;
}

async function ensureIndexes() {
  const db = await getDb();
  const col = db.collection<MessageDoc>("messages");

  // Safe to call multiple times
  await col.createIndex({ fromLower: 1, toLower: 1, createdAt: 1 });
  await col.createIndex({ fromLower: 1, createdAt: -1 });
  await col.createIndex({ toLower: 1, createdAt: -1 });
}

export async function addMessage(msg: ChatMessage) {
  await ensureIndexes();

  const db = await getDb();
  const col = db.collection<MessageDoc>("messages");

  const doc: MessageDoc = {
    ...msg,
    fromLower: msg.from.toLowerCase(),
    toLower: msg.to.toLowerCase(),
  };

  await col.insertOne(doc);
  return msg;
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

  return list as ChatMessage[];
}

export async function getThreadsForUser(user: string) {
  await ensureIndexes();

  const db = await getDb();
  const col = db.collection<MessageDoc>("messages");

  const u = user.trim().toLowerCase();

  // Latest first
  const msgs = await col
    .find({ $or: [{ fromLower: u }, { toLower: u }] })
    .sort({ createdAt: -1 })
    .project({ _id: 0, fromLower: 0, toLower: 0 })
    .toArray();

  // otherUser -> latest message
  const map = new Map<string, ChatMessage>();

  for (const m of msgs as unknown as ChatMessage[]) {
    const other =
      m.from.toLowerCase() === u ? m.to : m.from;

    const key = other.toLowerCase();
    if (!map.has(key)) {
      map.set(key, m);
    }
  }

  return Array.from(map.values()).map((m) => ({
    withUser: m.from.toLowerCase() === u ? m.to : m.from,
    lastMessage: m.text,
    updatedAt: m.createdAt,
  }));
}
