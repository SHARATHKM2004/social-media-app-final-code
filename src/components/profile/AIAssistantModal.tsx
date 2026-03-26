"use client";

import { useEffect, useState } from "react";

type AIMessage = {
  from: "bot" | "user";
  text: string;
  time: string;
};

const appKnowledgeBase = [
  {
    keywords: ["create post", "upload post", "new post", "post"],
    answer:
      "To create a post, go to Home and tap the Create button. Upload an image or video, add a caption, choose allow comments or repost, and click Post.",
  },
  {
    keywords: ["like", "likes"],
    answer:
      "You can like a post by clicking the Like button below the post. You can also see who liked the post by clicking the likes count.",
  },
  {
    keywords: ["comment", "comments"],
    answer:
      "Click on the Comment button below a post to view or add comments. Comments show the username and time.",
  },
  {
    keywords: ["delete post", "remove post", "delete"],
    answer:
      "To delete a post, go to your Profile. In your posts grid, click the delete icon on your own post. Only the author can delete their post.",
  },
  {
    keywords: ["profile", "edit profile"],
    answer:
      "Go to Profile to view your details. Use Edit Profile to update pronoun and bio. Username cannot be changed.",
  },
  {
    keywords: ["logout", "log out", "sign out"],
    answer:
      "To logout, go to Profile → Settings → Logout. You will be asked for confirmation before logging out.",
  },
  {
    keywords: ["search", "explore"],
    answer:
      "To search, open Home → Explore. You can search Users by username and Posts by caption or author name. Search is debounced so it stays fast.",
  },
  {
    keywords: ["trending", "latest", "sort"],
    answer:
      "In Home feed, you can sort posts by Latest or Trending. Trending ranks posts by engagement like likes, comments, and reposts.",
  },
  {
    keywords: ["chat", "message", "messaging"],
    answer:
      "To message someone, go to Chats, search for a user, and click Message. You can send messages in a chat view similar to WhatsApp.",
  },
];

function getBotReply(userText: string) {
  const text = userText.toLowerCase();

  for (const item of appKnowledgeBase) {
    if (item.keywords.some((k) => text.includes(k))) {
      return item.answer;
    }
  }

  return "I can help you with posts, profile, chats, search, sorting, and logout. Try asking about these features.";
}

export default function AIAssistantModal({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  const [aiInput, setAiInput] = useState("");
  const [aiMessages, setAiMessages] = useState<AIMessage[]>([
    {
      from: "bot",
      text: "Hii how can I help you?",
      time: new Date().toLocaleTimeString(),
    },
  ]);

  const [now, setNow] = useState(new Date());

  useEffect(() => {
    if (!open) return;
    const t = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(t);
  }, [open]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="w-full max-w-md rounded-2xl bg-white shadow-soft overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-gray-200 p-4">
          <div>
            <p className="text-sm font-bold text-gray-900">AI Assistant</p>
            <p className="text-xs text-green-600">
              ● Online • {now.toLocaleDateString()} {now.toLocaleTimeString()}
            </p>
          </div>

          <button
            onClick={onClose}
            className="rounded-xl px-3 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-100"
          >
            Close
          </button>
        </div>

        {/* Messages */}
        <div className="h-72 overflow-auto p-4 space-y-3 bg-neutral-50">
          {aiMessages.map((m, idx) => (
            <div
              key={idx}
              className={`flex ${m.from === "user" ? "justify-end" : "justify-start"}`}
            >
              <div
                className={`max-w-[80%] rounded-2xl px-4 py-2 text-sm ${
                  m.from === "user"
                    ? "bg-brand-blue text-white"
                    : "bg-white border border-gray-200 text-gray-800"
                }`}
              >
                <p>{m.text}</p>
                <p className={`mt-1 text-[10px] ${m.from === "user" ? "text-white/80" : "text-gray-400"}`}>
                  {m.time}
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* Input */}
        <div className="flex gap-2 border-t border-gray-200 p-3">
          <input
            value={aiInput}
            onChange={(e) => setAiInput(e.target.value)}
            placeholder="Type a message..."
            className="flex-1 rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm outline-none focus:border-brand-blue focus:ring-2 focus:ring-brand-blue/20"
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                const text = aiInput.trim();
                if (!text) return;

                const userMsg: AIMessage = {
                  from: "user",
                  text,
                  time: new Date().toLocaleTimeString(),
                };

                const botMsg: AIMessage = {
                  from: "bot",
                  text: getBotReply(text),
                  time: new Date().toLocaleTimeString(),
                };

                setAiMessages((prev) => [...prev, userMsg, botMsg]);
                setAiInput("");
              }
            }}
          />

          <button
            onClick={() => {
              const text = aiInput.trim();
              if (!text) return;

              const userMsg: AIMessage = {
                from: "user",
                text,
                time: new Date().toLocaleTimeString(),
              };

              const botMsg: AIMessage = {
                from: "bot",
                text: getBotReply(text),
                time: new Date().toLocaleTimeString(),
              };

              setAiMessages((prev) => [...prev, userMsg, botMsg]);
              setAiInput("");
            }}
            className="rounded-xl bg-brand-blue px-4 py-3 text-sm font-semibold text-white hover:opacity-95"
          >
            Send
          </button>
        </div>
      </div>
    </div>
  );
}