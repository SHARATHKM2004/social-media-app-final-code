"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import useBackToLanding from "@/components/useBackToLanding";

type Thread = {
  withUser: string;
  lastMessage: string;
  updatedAt: string;
  avatarDataUrl?: string;
  unreadCount: number;
};

type SearchUser = {
  username: string;
  avatarDataUrl: string;
};

function timeShort(iso: string) {
  const d = new Date(iso);
  return d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
}

export default function ChatsPage() {
  useBackToLanding();
  const router = useRouter();

  const [currentUser, setCurrentUser] = useState("");
  const [threads, setThreads] = useState<Thread[]>([]);
  const [results, setResults] = useState<SearchUser[]>([]);
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const user = window.localStorage.getItem("currentUser") || "";
    setCurrentUser(user);
  }, []);

  // ✅ Load chat threads
  async function loadThreads() {
    if (!currentUser) {
      setThreads([]);
      return;
    }

    const res = await fetch(`/api/threads?user=${encodeURIComponent(currentUser)}`, {
      cache: "no-store",
    });

    const data = await res.json().catch(() => ({}));
    if (res.ok) setThreads(data.threads || []);
    else setThreads([]);
  }

  /// ✅ initial load
  useEffect(() => {
    loadThreads();
  }, [currentUser]);

  // ✅ Part‑E: refresh threads when returning / focus / read / send
  useEffect(() => {
    const onFocus = () => loadThreads();
    const onVisible = () => {
      if (document.visibilityState === "visible") loadThreads();
    };
    const onCustom = () => loadThreads();

    window.addEventListener("focus", onFocus);
    document.addEventListener("visibilitychange", onVisible);
    window.addEventListener("chat-unread-refresh", onCustom);

    return () => {
      window.removeEventListener("focus", onFocus);
      document.removeEventListener("visibilitychange", onVisible);
      window.removeEventListener("chat-unread-refresh", onCustom);
    };
  }, [currentUser]);

  // ✅ Search users (unchanged)
  useEffect(() => {
    const t = setTimeout(async () => {
      const q = query.trim();
      if (!q) {
        setResults([]);
        return;
      }

      setLoading(true);
      try {
        const res = await fetch(`/api/users/search?q=${encodeURIComponent(q)}`);
        const data = await res.json();
        if (res.ok) setResults(data.users || []);
        else setResults([]);
      } finally {
        setLoading(false);
      }
    }, 300);

    return () => clearTimeout(t);
  }, [query]);

  return (
    <main className="min-h-screen bg-brand-blue">
      <div className="mx-auto max-w-md p-4 text-white">
        {/* Header */}
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold">Chats</h2>
          <button
            onClick={() => router.push("/home")}
            className="rounded-xl bg-white/15 px-3 py-2 text-xs font-semibold hover:bg-white/25"
          >
            Back to Home
          </button>
        </div>

        {/* Search */}
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search users..."
          className="mt-4 w-full rounded-xl bg-white px-4 py-3 text-sm text-gray-900 outline-none focus:ring-2 focus:ring-white/40"
        />

        {/* Body */}
        <div className="mt-4 rounded-2xl bg-white text-gray-900">
          {/* Search Results */}
          {query.trim() ? (
            <div className="p-2">
              {loading ? <p className="p-4 text-sm">Searching...</p> : null}
              {!loading && results.length === 0 ? (
                <p className="p-4 text-sm text-gray-500">No users found.</p>
              ) : null}

              {results.map((u) => (
                <Link
                  key={u.username}
                  href={`/chats/${encodeURIComponent(u.username)}`}
                  className="flex items-center gap-3 rounded-xl px-3 py-3 hover:bg-gray-50"
                >
                  <div className="h-10 w-10 overflow-hidden rounded-full bg-gray-200">
                    {u.avatarDataUrl ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={u.avatarDataUrl} alt={u.username} className="h-full w-full object-cover" />
                    ) : (
                      <span className="flex h-full w-full items-center justify-center">🙂</span>
                    )}
                  </div>
                  <p className="font-semibold">{u.username}</p>
                </Link>
              ))}
            </div>
          ) : (
            <>
              {/* Threads List */}
              {threads.length === 0 ? (
                <p className="p-6 text-center text-sm text-gray-500">
                  No chats yet. Search a user above and start messaging.
                </p>
              ) : (
                threads.map((t) => (
                  <Link
                    key={t.withUser}
                    href={`/chats/${encodeURIComponent(t.withUser)}`}
                    className="flex items-center gap-3 border-b border-gray-100 px-4 py-3 hover:bg-gray-50"
                  >
                    {/* Avatar */}
                    <div className="h-10 w-10 overflow-hidden rounded-full bg-gray-200">
                      {t.avatarDataUrl ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={t.avatarDataUrl} alt={t.withUser} className="h-full w-full object-cover" />
                      ) : (
                        <span className="flex h-full w-full items-center justify-center">🙂</span>
                      )}
                    </div>

                    {/* Name + last message */}
                    <div className="min-w-0 flex-1">
                      <p className={`${t.unreadCount > 0 ? "font-bold" : "font-semibold"} truncate`}>
                        {t.withUser}
                      </p>
                      <p
                        className={`truncate text-xs ${
                          t.unreadCount > 0 ? "font-semibold text-gray-900" : "text-gray-500"
                        }`}
                      >
                        {t.lastMessage || "No messages"}
                      </p>
                    </div>

                    {/* Time + unread badge */}
                    <div className="flex flex-col items-end gap-1">
                      <span className="text-[11px] text-gray-500">{timeShort(t.updatedAt)}</span>
                      {t.unreadCount > 0 ? (
                        <span className="min-w-[22px] rounded-full bg-brand-blue px-2 py-0.5 text-center text-[11px] font-bold text-white">
                          {t.unreadCount > 99 ? "99+" : t.unreadCount}
                        </span>
                      ) : null}
                    </div>
                  </Link>
                ))
              )}
            </>
          )}
        </div>
      </div>
    </main>
  );
}