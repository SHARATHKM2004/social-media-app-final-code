import { promises as fs } from "fs";
import path from "path";

export type ChatMessage = {
  id: string;
  from: string;
  to: string;
  text: string;
  createdAt: string;
};

const filePath = path.join(process.cwd(), "src", "data", "messages.json");

export async function readMessages(): Promise<ChatMessage[]> {
  try {
    const data = await fs.readFile(filePath, "utf-8");
    return JSON.parse(data || "[]") as ChatMessage[];
  } catch {
    return [];
  }
}

export async function writeMessages(msgs: ChatMessage[]) {
  await fs.mkdir(path.dirname(filePath), { recursive: true });
  await fs.writeFile(filePath, JSON.stringify(msgs, null, 2), "utf-8");
}

export async function addMessage(msg: ChatMessage) {
  const msgs = await readMessages();
  msgs.push(msg);
  await writeMessages(msgs);
  return msg;
}

export async function getConversation(userA: string, userB: string) {
  const msgs = await readMessages();
  const a = userA.toLowerCase();
  const b = userB.toLowerCase();

  return msgs.filter((m) => {
    const f = m.from.toLowerCase();
    const t = m.to.toLowerCase();
    return (f === a && t === b) || (f === b && t === a);
  });
}

export async function getThreadsForUser(user: string) {
  const msgs = await readMessages();
  const u = user.toLowerCase();

  // otherUser -> latest message
  const map = new Map<string, ChatMessage>();

  for (const m of msgs) {
    const f = m.from.toLowerCase();
    const t = m.to.toLowerCase();

    if (f === u || t === u) {
      const other = f === u ? m.to : m.from;
      const existing = map.get(other.toLowerCase());
      if (!existing || new Date(m.createdAt) > new Date(existing.createdAt)) {
        map.set(other.toLowerCase(), m);
      }
    }
  }

  return Array.from(map.values())
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .map((m) => ({
      withUser: m.from.toLowerCase() === u ? m.to : m.from,
      lastMessage: m.text,
      updatedAt: m.createdAt,
    }));
}