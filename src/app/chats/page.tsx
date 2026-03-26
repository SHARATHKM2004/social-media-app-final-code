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
};

type SearchUser = { username: string; avatarDataUrl: string };

function timeShort(iso: string) {
  const d = new Date(iso);
  return d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
}

export default function ChatsPage() {
  useBackToLanding();

  const router = useRouter();

const [currentUser, setCurrentUser] = useState("");

useEffect(() => {
  const user = window.localStorage.getItem("currentUser") || "";
  setCurrentUser(user);
}, []);

const [threads, setThreads] = useState<Thread[]>([]);
const [results, setResults] = useState<SearchUser[]>([]);
 
  const [query, setQuery] = useState("");
  
  const [loading, setLoading] = useState(false);

useEffect(() => {
  async function loadThreads() {
    if (!currentUser) {
      setThreads([]);
      return;
    }

    const res = await fetch(`/api/threads?user=${encodeURIComponent(currentUser)}`);
    const data = await res.json();

    if (res.ok) setThreads(data.threads || []);
    else setThreads([]);
  }

  loadThreads();
}, [currentUser]);

 

  // search users like explore
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
    <main className="min-h-screen bg-neutral-50">
      <div className="mx-auto min-h-screen max-w-md bg-white">
        {/* Header */}
        <div className="sticky top-0 z-10 border-b border-gray-200 bg-brand-blue px-4 py-4">
          <div className="flex items-center justify-between">
            <h1 className="text-lg font-bold text-white">Chats</h1>
            <span className="text-xs text-white/90">{new Date().toLocaleDateString()}</span>
          </div>
<button
  onClick={() => router.push("/home")}
  className="rounded-xl bg-white/15 px-3 py-2 text-xs font-semibold text-white hover:bg-white/25"
>
  Back to Home
</button>
          <div className="mt-3">
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search users..."
              className="w-full rounded-xl bg-white px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-white/40"
            />
          </div>
        </div>

        {/* Body */}
        <div className="p-3">
          {/* Search results (like explore) */}
          {query.trim() ? (
            <div className="space-y-2">
              {loading ? <p className="text-sm text-gray-600">Searching...</p> : null}
              {!loading && results.length === 0 ? (
                <p className="text-sm text-gray-600">No users found.</p>
              ) : null}

              {results.map((u) => (
                <div
                  key={u.username}
                  className="flex items-center gap-3 rounded-2xl border border-gray-200 bg-white p-3"
                >
                  <div className="h-10 w-10 overflow-hidden rounded-full border border-gray-200 bg-neutral-100">
                    {u.avatarDataUrl ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={u.avatarDataUrl} alt="avatar" className="h-full w-full object-cover" />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center">🙂</div>
                    )}
                  </div>

                  <div className="flex-1">
                    <p className="text-sm font-semibold text-gray-900">{u.username}</p>
                    <p className="text-xs text-gray-500">View profile or message</p>
                  </div>

                  <div className="flex gap-2">
                    <Link
                      href={`/u/${encodeURIComponent(u.username)}`}
                      className="rounded-xl border border-gray-200 px-3 py-2 text-xs font-semibold text-gray-700 hover:bg-gray-50"
                    >
                      Profile
                    </Link>

                    <Link
                      href={`/chats/${encodeURIComponent(u.username)}`}
                      className="rounded-xl bg-brand-blue px-3 py-2 text-xs font-semibold text-white hover:opacity-95"
                    >
                      Message
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <>
              {/* Threads list */}
              {threads.length === 0 ? (
                <div className="mt-10 text-center">
                  <p className="text-sm font-semibold text-gray-900">No chats yet</p>
                  <p className="mt-1 text-sm text-gray-600">
                    Search a user above and start messaging.
                  </p>
                </div>
              ) : (
                <div className="space-y-1">
                  {threads.map((t) => (
                    <Link
                      key={t.withUser}
                      href={`/chats/${encodeURIComponent(t.withUser)}`}
                      className="flex items-center gap-3 rounded-2xl px-3 py-3 hover:bg-gray-50"
                    >
                      <div className="h-12 w-12 overflow-hidden rounded-full border border-gray-200 bg-neutral-100">
                        {t.avatarDataUrl ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img src={t.avatarDataUrl} alt="avatar" className="h-full w-full object-cover" />
                        ) : (
                          <div className="flex h-full w-full items-center justify-center text-lg">🙂</div>
                        )}
                      </div>

                      <div className="flex-1">
                        <p className="text-sm font-semibold text-gray-900">{t.withUser}</p>
                        <p className="truncate text-xs text-gray-600">{t.lastMessage}</p>
                      </div>

                      <p className="text-xs text-gray-500">{timeShort(t.updatedAt)}</p>
                    </Link>
                  ))}
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </main>
  );
}