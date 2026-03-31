"use client";

import { useEffect, useRef, useState } from "react";
import { useParams } from "next/navigation";
import useBackToLanding from "@/components/useBackToLanding";

type AttachmentKind = "image" | "video" | "file";
type ChatAttachment = {
  kind: AttachmentKind;
  name: string;
  mime: string;
  size: number;
  dataUrl: string;
};

type Msg = {
  id: string;
  from: string;
  to: string;
  text: string;
  createdAt: string;
  read: boolean;
  readAt?: string;
  attachments?: ChatAttachment[];
};

function formatDay(iso: string) {
  return new Date(iso).toLocaleDateString();
}
function formatTime(iso: string) {
  return new Date(iso).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
}

export default function ChatWithUserPage() {
  useBackToLanding();

  const params = useParams<{ username?: string }>();
  const otherUser = params?.username ? decodeURIComponent(params.username) : "";

  const [currentUser, setCurrentUser] = useState("");
  useEffect(() => {
    const user = window.localStorage.getItem("currentUser") || "";
    setCurrentUser(user);
  }, []);

  const [messages, setMessages] = useState<Msg[]>([]);
  const [text, setText] = useState("");

  const [attachments, setAttachments] = useState<ChatAttachment[]>([]);
  const [sendError, setSendError] = useState("");

  const [otherUserAvatar, setOtherUserAvatar] = useState<string>("");

  const didMarkRead = useRef(false);

  // Load messages from server
  useEffect(() => {
    async function loadFromServer() {
      if (!currentUser || !otherUser) {
        setMessages([]);
        return;
      }

      const res = await fetch(
        `/api/messages?userA=${encodeURIComponent(currentUser)}&userB=${encodeURIComponent(otherUser)}`
      );
      const data = await res.json().catch(() => ({}));
      if (res.ok) setMessages((data.messages || []) as Msg[]);
      else setMessages([]);
    }

    loadFromServer();
  }, [currentUser, otherUser]);

  // Mark as read when opening chat (✅ Part-E: dispatch refresh event)
  useEffect(() => {
    async function markRead() {
      if (!currentUser || !otherUser) return;
      if (didMarkRead.current) return;
      didMarkRead.current = true;

      await fetch("/api/messages/read", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ reader: currentUser, withUser: otherUser }),
      }).catch(() => null);

      // ✅ Part-E: tell Home/Chats page to refresh unread counts immediately
      window.dispatchEvent(new Event("chat-unread-refresh"));
    }

    markRead();
  }, [currentUser, otherUser]);

  // Load avatar
  useEffect(() => {
    if (!otherUser) return;
    async function loadAvatar() {
      const res = await fetch(`/api/users/${encodeURIComponent(otherUser)}`);
      const data = await res.json().catch(() => ({}));
      if (res.ok) setOtherUserAvatar(data?.avatarDataUrl || "");
    }
    loadAvatar();
  }, [otherUser]);

  async function onPickFiles(files: FileList | null) {
    setSendError("");
    if (!files || files.length === 0) return;

    const maxFiles = 3;
    const picked = Array.from(files).slice(0, maxFiles);

    const next: ChatAttachment[] = [];

    for (const f of picked) {
      const isImage = f.type.startsWith("image/");
      const isVideo = f.type.startsWith("video/");
      const isDoc = !isImage && !isVideo;

      const maxSize =
        isImage ? 1 * 1024 * 1024 : isVideo ? 5 * 1024 * 1024 : 1 * 1024 * 1024;

      if (f.size > maxSize) {
        setSendError(
          isImage ? "Image too large (max 1MB)" : isVideo ? "Video too large (max 5MB)" : "Document too large (max 1MB)"
        );
        continue;
      }

      const kind: AttachmentKind = isImage ? "image" : isVideo ? "video" : "file";

      const dataUrl = await new Promise<string>((resolve) => {
        const r = new FileReader();
        r.onload = () => resolve(String(r.result || ""));
        r.readAsDataURL(f);
      });

      next.push({
        kind,
        name: f.name,
        mime: f.type || "application/octet-stream",
        size: f.size,
        dataUrl,
      });
    }

    setAttachments((prev) => [...prev, ...next].slice(0, 3));
  }

  function removeAttachment(idx: number) {
    setAttachments((prev) => prev.filter((_, i) => i !== idx));
  }

  async function send() {
    setSendError("");
    const msgText = text.trim();

    if (!currentUser || !otherUser) return;
    if (!msgText && attachments.length === 0) {
      setSendError("Type a message or attach a file.");
      return;
    }

    const res = await fetch("/api/messages/send", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        from: currentUser,
        to: otherUser,
        text: msgText,
        attachments,
      }),
    });

    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      setSendError(data?.error || "Failed to send");
      return;
    }

    setMessages((prev) => [...prev, data.msg as Msg]);
    setText("");
    setAttachments([]);

    // ✅ Part-E: sender UI triggers refresh (useful when navigating back)
    window.dispatchEvent(new Event("chat-unread-refresh"));
  }

  return (
    <main className="min-h-screen bg-neutral-50">
      <div className="mx-auto min-h-screen max-w-md bg-white flex flex-col">
        {/* Header */}
        <div className="sticky top-0 z-10 bg-brand-blue px-4 py-4 text-white">
          <div className="flex items-center gap-3">
            <button
              onClick={() => (window.location.href = "/chats")}
              className="rounded-xl bg-white/15 px-3 py-2 text-xs font-semibold text-white hover:bg-white/25"
            >
              Back
            </button>

            <div className="h-9 w-9 overflow-hidden rounded-full bg-white/20 border border-white/30 flex items-center justify-center">
              {otherUserAvatar ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={otherUserAvatar} alt={otherUser} className="h-full w-full object-cover" />
              ) : (
                <span>🙂</span>
              )}
            </div>

            <div className="flex-1">
              <p className="text-sm font-bold">{otherUser}</p>
              <p className="text-xs text-white/90">Chat</p>
            </div>
          </div>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-auto bg-neutral-50 p-4 space-y-2">
          {messages.length === 0 ? (
            <p className="text-center text-sm text-gray-600 mt-6">No messages yet. Say hi 👋</p>
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
                    <span className="rounded-full bg-gray-200 px-3 py-1 text-xs text-gray-700">{day}</span>
                  </div>
                ) : null}

                <div className={`flex ${mine ? "justify-end" : "justify-start"}`}>
                  <div
                    className={`max-w-[85%] rounded-2xl px-4 py-2 text-sm ${
                      mine ? "bg-brand-blue text-white" : "bg-white border border-gray-200 text-gray-800"
                    }`}
                  >
                    {m.attachments && m.attachments.length > 0 ? (
                      <div className="mb-2 space-y-2">
                        {m.attachments.map((a, i) => (
                          <div key={i} className="rounded-xl overflow-hidden border border-white/20">
                            {a.kind === "image" ? (
                              // eslint-disable-next-line @next/next/no-img-element
                              <img src={a.dataUrl} alt={a.name} className="w-full max-h-[240px] object-contain" />
                            ) : a.kind === "video" ? (
                              <video controls className="w-full max-h-[240px] bg-black">
                                <source src={a.dataUrl} type={a.mime} />
                              </video>
                            ) : (
                              <a
                                href={a.dataUrl}
                                download={a.name}
                                className={`block px-3 py-2 text-xs underline ${
                                  mine ? "text-white" : "text-brand-blue"
                                }`}
                              >
                                📄 {a.name}
                              </a>
                            )}
                          </div>
                        ))}
                      </div>
                    ) : null}

                    {m.text ? <p>{m.text}</p> : null}

                    <p className={`mt-1 text-[10px] ${mine ? "text-white/80" : "text-gray-400"}`}>
                      {formatTime(m.createdAt)}
                      {mine ? <span className="ml-2">{m.read ? "✓✓" : "✓"}</span> : null}
                    </p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Attachments preview */}
        {attachments.length > 0 ? (
          <div className="border-t border-gray-200 bg-white px-3 py-2">
            <p className="text-xs font-semibold text-gray-700 mb-2">Attachments</p>
            <div className="flex gap-2 overflow-x-auto">
              {attachments.map((a, i) => (
                <div key={i} className="relative shrink-0 w-24">
                  <button
                    onClick={() => removeAttachment(i)}
                    className="absolute -right-2 -top-2 h-6 w-6 rounded-full bg-black/70 text-white text-xs"
                    title="Remove"
                  >
                    ✕
                  </button>

                  <div className="h-20 w-24 rounded-xl border border-gray-200 overflow-hidden bg-neutral-100 flex items-center justify-center">
                    {a.kind === "image" ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={a.dataUrl} alt={a.name} className="h-full w-full object-cover" />
                    ) : a.kind === "video" ? (
                      <span className="text-xs text-gray-700">🎬 video</span>
                    ) : (
                      <span className="text-xs text-gray-700">📄 file</span>
                    )}
                  </div>
                  <p className="mt-1 text-[10px] text-gray-600 truncate">{a.name}</p>
                </div>
              ))}
            </div>
          </div>
        ) : null}

        {/* Input */}
        <div className="border-t border-gray-200 bg-white p-3 flex gap-2 items-center">
          <label className="cursor-pointer rounded-xl border border-gray-200 bg-white px-3 py-3 text-sm">
            📎
            <input
              type="file"
              className="hidden"
              accept="image/*,video/*,.pdf,.doc,.docx,.txt"
              multiple
              onChange={(e) => onPickFiles(e.target.files)}
            />
          </label>

          <input
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Type a message..."
            className="flex-1 rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm outline-none focus:border-brand-blue focus:ring-2 focus:ring-brand-blue/20"
            onKeyDown={(e) => {
              if (e.key === "Enter") send();
            }}
          />

          <button onClick={send} className="rounded-xl bg-brand-blue px-4 py-3 text-sm font-semibold text-white hover:opacity-95">
            Send
          </button>
        </div>

        {sendError ? <p className="px-4 pb-3 text-sm text-red-600">{sendError}</p> : null}
      </div>
    </main>
  );
}