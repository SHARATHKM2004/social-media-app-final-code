export const runtime = "nodejs";

import { NextResponse } from "next/server";
import clientPromise from "@/lib/mongodb";
import { toggleStoryLike, getStoryLikeState } from "@/lib/storyLikeStore";
import { addNotification } from "@/lib/notificationStore";

type StoryDoc = {
  id: string;
  username: string;
};

const DB_NAME = "socialApp";
const STORIES = "stories";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const storyId = (searchParams.get("storyId") || "").trim();
    const user = (searchParams.get("user") || "").trim();

    if (!storyId || !user) {
      return NextResponse.json(
        { error: "storyId and user required" },
        { status: 400 }
      );
    }

    const state = await getStoryLikeState(storyId, user);
    return NextResponse.json({ ok: true, ...state }, { status: 200 });
  } catch (e) {
    console.error(e);
    return NextResponse.json(
      { error: "Failed to load like state" },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => ({}));
    const storyId = (body?.storyId || "").trim();
    const username = (body?.username || "").trim();

    if (!storyId || !username) {
      return NextResponse.json(
        { error: "storyId and username required" },
        { status: 400 }
      );
    }

    // find story owner (typed, no any)
    const client = await clientPromise;
    const db = client.db(DB_NAME);

    const story = await db
      .collection<StoryDoc>(STORIES)
      .findOne({ id: storyId });

    if (!story) {
      return NextResponse.json(
        { error: "Story not found" },
        { status: 404 }
      );
    }

    const owner = story.username;

    const { liked, likesCount } = await toggleStoryLike(storyId, username);

    // notify only on newly liked
    if (liked) {
      await addNotification({
        toUser: owner,
        fromUser: username,
        type: "story_like",
        storyId: storyId,
      });
    }

    return NextResponse.json(
      { ok: true, liked, likesCount },
      { status: 200 }
    );
  } catch (e) {
    console.error(e);
    return NextResponse.json(
      { error: "Failed to like story" },
      { status: 500 }
    );
  }
}