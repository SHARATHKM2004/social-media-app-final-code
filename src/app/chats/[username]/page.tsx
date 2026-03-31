"use client";

import { useEffect, useMemo, useState } from "react";
import { useParams } from "next/navigation";
import useBackToLanding from "@/components/useBackToLanding";

type Msg = {
  id: string;
  from: string;
  to: string;
  text: string;
  createdAt: string;
};

type Thread = {
  withUser: string;
  lastMessage: string;
  updatedAt: string;
  avatarDataUrl?: string;
};

function makeId() {
  return `${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

function keyForConversation(a: string, b: string) {
  const x = (a || "").toLowerCase();
  const y = (b || "").toLowerCase();
  return x < y ? `chat_${x}__${y}` : `chat_${y}__${x}`;
}

function formatDay(iso: string) {
  return new Date(iso).toLocaleDateString();
}

function formatTime(iso: string) {
  return new Date(iso).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
}

export default function ChatWithUserPage() {
  useBackToLanding(); // keeping as-is (you said back issue is not there)

  const params = useParams<{ username?: string }>();
const otherUser = params?.username
  ? decodeURIComponent(params.username)
  : "";


  const [currentUser, setCurrentUser] = useState("");

useEffect(() => {
  const user = window.localStorage.getItem("currentUser") || "";
  setCurrentUser(user);
}, []);
  const [messages, setMessages] = useState<Msg[]>([]);
  const [text, setText] = useState("");

  const convoKey = useMemo(
    () => keyForConversation(currentUser, otherUser),
    [currentUser, otherUser]
  );

  function loadMessages(key: string) {
    const raw = localStorage.getItem(key);
    const list: Msg[] = raw ? (JSON.parse(raw) as Msg[]) : [];
    setMessages(list);
  }

  function saveMessages(key: string, list: Msg[]) {
    localStorage.setItem(key, JSON.stringify(list));
    setMessages(list);
  }

  function updateThreads(lastMsg: string) {
    const now = new Date().toISOString();

    function upsert(user: string, withUser: string) {
      const raw = localStorage.getItem(`threads_${user}`);
      const list: Thread[] = raw ? (JSON.parse(raw) as Thread[]) : [];

      const idx = list.findIndex(
        (t) => (t.withUser || "").toLowerCase() === withUser.toLowerCase()
      );

      const thread: Thread = { withUser, lastMessage: lastMsg, updatedAt: now };

      if (idx === -1) list.push(thread);
      else list[idx] = thread;

      localStorage.setItem(`threads_${user}`, JSON.stringify(list));
    }

    // Update chat list for both users (simple localStorage approach)
    if (currentUser) upsert(currentUser, otherUser);
    if (otherUser) upsert(otherUser, currentUser);
  }

  // Load messages whenever this chat key changes
  useEffect(() => {
  async function loadFromServer() {
    if (!currentUser || !otherUser) {
      setMessages([]);
      return;
    }

    const res = await fetch(
      `/api/messages?userA=${encodeURIComponent(currentUser)}&userB=${encodeURIComponent(otherUser)}`
    );
    const data = await res.json();
    if (res.ok) setMessages(data.messages || []);
    else setMessages([]);
  }

  loadFromServer();
}, [currentUser, otherUser]);

async function send() {
  const msgText = text.trim();
  if (!msgText || !currentUser) return;

  try {
    const res = await fetch("/api/messages/send", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ from: currentUser, to: otherUser, text: msgText }),
    });

    const data = await res.json().catch(() => null);
    console.log("SEND:", res.status, data);

    if (!res.ok) {
      alert(data?.error || "Failed to send message");
      return;
    }

    setMessages((prev) => [...prev, data.msg]);
    setText("");
  } catch (e) {
    console.error("Send error:", e);
    alert("Network error while sending message");
  }
}
  // Date separators
  

  return (
    <main className="min-h-screen bg-neutral-50">
      <div className="mx-auto min-h-screen max-w-md bg-white flex flex-col">
        {/* Header */}
        <div className="sticky top-0 z-10 bg-brand-blue px-4 py-4 text-white">
          <div className="flex items-center gap-3">
            {/* Keeping your existing behavior */}
            <button
              onClick={() => (window.location.href = "/chats")}
              className="rounded-xl bg-white/15 px-3 py-2 text-xs font-semibold text-white hover:bg-white/25"
            >
              Back 
            </button>

            <div className="h-9 w-9 rounded-full bg-white/20 flex items-center justify-center">
              🙂
            </div>

            <div className="flex-1">
              <p className="text-sm font-bold">{otherUser}</p>
              <p className="text-xs text-white/90">Online</p>
            </div>
          </div>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-auto bg-neutral-50 p-4 space-y-2">
          {messages.length === 0 ? (
            <p className="text-center text-sm text-gray-600 mt-6">
              No messages yet. Say hi 👋
            </p>
          ) : null}
{messages.map((m, idx) => {
  const day = formatDay(m.createdAt);
  const prevDay = idx === 0 ? "" : formatDay(messages[idx - 1].createdAt);
  const showDay = day !== prevDay;

  const mine = m.from === currentUser;

  return (
    <div key={m.id}>
      {showDay ? (
        <div className="my-3 flex justify-center">
          <span className="rounded-full bg-gray-200 px-3 py-1 text-xs text-gray-700">
            {day}
          </span>
        </div>
      ) : null}

      <div className={`flex ${mine ? "justify-end" : "justify-start"}`}>
        <div
          className={`max-w-[80%] rounded-2xl px-4 py-2 text-sm ${
            mine
              ? "bg-brand-blue text-white"
              : "bg-white border border-gray-200 text-gray-800"
          }`}
        >
          <p>{m.text}</p>
          <p className={`mt-1 text-[10px] ${mine ? "text-white/80" : "text-gray-400"}`}>
            {formatTime(m.createdAt)}
          </p>
        </div>
      </div>
    </div>
  );
})}
        </div>

        {/* Input */}
        <div className="border-t border-gray-200 bg-white p-3 flex gap-2">
          <input
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Type a message..."
            className="flex-1 rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm outline-none focus:border-brand-blue focus:ring-2 focus:ring-brand-blue/20"
            onKeyDown={(e) => {
              if (e.key === "Enter") send();
            }}
          />

          <button
            onClick={send}
            className="rounded-xl bg-brand-blue px-4 py-3 text-sm font-semibold text-white hover:opacity-95"
          >
            Send
          </button>
        </div>
      </div>
    </main>
  );
}
