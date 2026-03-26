import { streamText } from "ai";
import { openai } from "@ai-sdk/openai";

export const runtime = "nodejs";
export const maxDuration = 30; // optional safety limit

// ✅ App-aware knowledge context (so it answers about YOUR app)
const APP_KNOWLEDGE = `
You are the AI Assistant for a Mini Social Media app built in Next.js.
Answer questions ONLY about this app and how to use it.

Key features:
- Register/Login with localStorage session (currentUser).
- Home feed showing posts with image/video, caption, time ago.
- Core mutations: create post, like/unlike, comment, repost, delete own posts (from profile).
- Sorting: latest (createdAt) and trending (likes*2 + comments*3 + reposts*4).
- Debounced search: users by username, posts by caption/author; search results open /u/[username] and /post/[id].
- Public profile shows posts count + grid.
- Chats: WhatsApp-style UI with server-side messages JSON storage, threads list for chat previews.
- Settings: account actions, feedback, privacy policy, logout confirm.
Explain steps clearly and beginner-friendly.

If the question is unrelated to the app, politely say you can help only with app usage and features.
`;

export async function POST(req: Request) {
  const { messages } = await req.json();

  const result = streamText({
    model: openai("gpt-4o-mini"),
    system: APP_KNOWLEDGE,
    messages,
  });

  // ✅ Streams tokens so the UI shows typing effect
return result.toUIMessageStreamResponse();
}