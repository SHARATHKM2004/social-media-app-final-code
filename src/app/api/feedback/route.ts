export const runtime = "nodejs";

import { NextResponse } from "next/server";
import { promises as fs } from "fs";
import path from "path";

type FeedbackItem = {
  id: string;
  username: string;
  message: string;
  createdAt: string;
  files: { name: string; type: string; dataUrl: string }[];
};

const filePath = path.join(process.cwd(), "src", "data", "feedback.json");

async function readFeedback(): Promise<FeedbackItem[]> {
  try {
    const data = await fs.readFile(filePath, "utf-8");
    return JSON.parse(data || "[]");
  } catch {
    return [];
  }
}

async function writeFeedback(items: FeedbackItem[]) {
  await fs.mkdir(path.dirname(filePath), { recursive: true });
  await fs.writeFile(filePath, JSON.stringify(items, null, 2), "utf-8");
}

function makeId() {
  return `${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { username, message, files } = body as {
      username: string;
      message: string;
      files: { name: string; type: string; dataUrl: string }[];
    };

    if (!username || !message?.trim()) {
      return NextResponse.json({ error: "username and message required" }, { status: 400 });
    }

    const items = await readFeedback();

    items.unshift({
      id: makeId(),
      username,
      message: message.trim(),
      createdAt: new Date().toISOString(),
      files: Array.isArray(files) ? files : [],
    });

    await writeFeedback(items);

    return NextResponse.json({ ok: true }, { status: 200 });
  } catch {
    return NextResponse.json({ error: "Failed to submit feedback" }, { status: 500 });
  }
}