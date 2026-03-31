import clientPromise from "./mongodb";
import { findUserByUsername } from "@/lib/userStore";

type UserWithAvatar = {
  avatarDataUrl?: string;
};

export type Story = {
  id: string;
  username: string;
  mediaDataUrl: string; // image only
  createdAt: string;
  expiresAt: string;
};

export type TrayItem = {
  username: string;
  avatarDataUrl: string;
  latestStoryId: string;
  latestCreatedAt: string;
  hasUnseen: boolean;
};

const DB_NAME = "socialApp";
const STORIES = "stories";
const VIEWS = "storyViews";

function makeId() {
  return `${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

function nowISO() {
  return new Date().toISOString();
}

function plusHoursISO(hours: number) {
  return new Date(Date.now() + hours * 60 * 60 * 1000).toISOString();
}

export async function addStory(username: string, mediaDataUrl: string) {
  const u = username.trim();
  if (!u) throw new Error("username required");

  // image only
  if (!mediaDataUrl || !mediaDataUrl.startsWith("data:image/")) {
    throw new Error("Only image stories are supported");
  }

  // Basic size guard (base64 can explode quickly). ~1MB raw -> ~1.33MB base64.
  // This is a simple guard based on string length.
  if (mediaDataUrl.length > 1_800_000) {
    throw new Error("Image too large. Please upload a smaller image (<= ~1MB).");
  }

  const client = await clientPromise;
  const db = client.db(DB_NAME);

  const doc: Story = {
    id: makeId(),
    username: u,
    mediaDataUrl,
    createdAt: nowISO(),
    expiresAt: plusHoursISO(24),
  };

  await db.collection(STORIES).insertOne(doc);
  return doc;
}

export async function listActiveStoriesForUser(username: string) {
  const client = await clientPromise;
  const db = client.db(DB_NAME);

  const u = username.trim();
  const now = nowISO();

  const stories = await db
    .collection(STORIES)
    .find({ username: { $regex: new RegExp(`^${u}$`, "i") }, expiresAt: { $gt: now } })
    .sort({ createdAt: 1 })
    .toArray();

  return stories as unknown as Story[];
}

export async function markStorySeen(storyId: string, viewer: string) {
  const client = await clientPromise;
  const db = client.db(DB_NAME);

  const v = viewer.trim();
  if (!v) return true;

  await db.collection(VIEWS).updateOne(
    { storyId, viewer: { $regex: new RegExp(`^${v}$`, "i") } },
    { $set: { storyId, viewer: v, seenAt: nowISO() } },
    { upsert: true }
  );

  return true;
}

async function hasViewerSeenStory(storyId: string, viewer: string) {
  const client = await clientPromise;
  const db = client.db(DB_NAME);

  const v = viewer.trim();
  if (!v) return false;

  const found = await db.collection(VIEWS).findOne({
    storyId,
    viewer: { $regex: new RegExp(`^${v}$`, "i") },
  });

  return !!found;
}

export async function getStoriesTray(viewer: string, limitUsers = 20) {
  const client = await clientPromise;
  const db = client.db(DB_NAME);

  const now = nowISO();

  // Pull active stories, newest first
  const active = await db
    .collection(STORIES)
    .find({ expiresAt: { $gt: now } })
    .sort({ createdAt: -1 })
    .limit(500)
    .toArray();

  // Build latest story per user
  const map = new Map<string, Story>();
  for (const raw of active as unknown as Story[]) {
    const key = (raw.username || "").toLowerCase();
    if (!map.has(key)) map.set(key, raw);
    if (map.size >= limitUsers) break;
  }

  const items: TrayItem[] = [];

  for (const story of map.values()) {
    const userDoc = await findUserByUsername(story.username);
const avatarDataUrl = ((userDoc || {}) as UserWithAvatar).avatarDataUrl || "";

    const seen = await hasViewerSeenStory(story.id, viewer);

    items.push({
      username: story.username,
      avatarDataUrl,
      latestStoryId: story.id,
      latestCreatedAt: story.createdAt,
      hasUnseen: !seen,
    });
  }

  // Sort: unseen first, then newest
  items.sort((a, b) => {
    if (a.hasUnseen !== b.hasUnseen) return a.hasUnseen ? -1 : 1;
    return new Date(b.latestCreatedAt).getTime() - new Date(a.latestCreatedAt).getTime();
  });

  return items;
}