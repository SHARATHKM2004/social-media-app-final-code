"use client";

import Link from "next/link";
import { SearchUser } from "@/types/user";

type SearchPost = {
  id: string;
  author: string;
  caption: string;
  mediaType: "image" | "video";
  mediaDataUrl: string;
  createdAt: string;
  likesCount: number;
  commentsCount: number;
};

export default function ExplorePanel({
  mode,
  setMode,
  query,
  setQuery,
  userResults,
  postResults,
  loading,
}: {
  mode: "users" | "posts";
  setMode: (v: "users" | "posts") => void;
  query: string;
  setQuery: (v: string) => void;
  userResults: SearchUser[];
  postResults: SearchPost[];
  loading: boolean;
}) {
  return (
    <>
      <p className="mt-1 text-sm text-gray-600">Explore — search users or posts</p>

      {/* Toggle */}
      <div className="mt-3 flex gap-2">
        <button
          onClick={() => setMode("users")}
          className={`flex-1 rounded-xl px-3 py-2 text-sm font-semibold ${
            mode === "users"
              ? "bg-brand-blue text-white"
              : "border border-gray-200 bg-white text-gray-700 hover:bg-gray-50"
          }`}
        >
          Users
        </button>

        <button
          onClick={() => setMode("posts")}
          className={`flex-1 rounded-xl px-3 py-2 text-sm font-semibold ${
            mode === "posts"
              ? "bg-brand-blue text-white"
              : "border border-gray-200 bg-white text-gray-700 hover:bg-gray-50"
          }`}
        >
          Posts
        </button>
      </div>

      {/* Search box */}
      <div className="mt-4">
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder={mode === "users" ? "Search username..." : "Search caption or author..."}
          className="w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm outline-none focus:border-brand-blue focus:ring-2 focus:ring-brand-blue/20"
        />
      </div>

      <div className="mt-4 space-y-2">
        {loading ? <p className="text-sm text-gray-600">Searching...</p> : null}

        {!loading && query.trim() && mode === "users" && userResults.length === 0 ? (
          <p className="text-sm text-gray-600">No users found.</p>
        ) : null}

        {!loading && query.trim() && mode === "posts" && postResults.length === 0 ? (
          <p className="text-sm text-gray-600">No posts found.</p>
        ) : null}

        {/* Users results */}
        {mode === "users" &&
          userResults.map((u) => (
            <Link
              key={u.username}
              href={`/u/${encodeURIComponent(u.username)}`}
              className="flex items-center gap-3 rounded-2xl border border-gray-200 bg-white p-3 hover:bg-gray-50"
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

                {/* ✅ BIO goes here */}
                {u.bio?.trim() ? (
                  <p className="text-xs text-gray-600 line-clamp-1">{u.bio}</p>
                ) : (
                  <p className="text-xs text-gray-400">No bio</p>
                )}

                <p className="mt-1 text-xs text-gray-500">Tap to view profile</p>
              </div>
            </Link>
          ))}

        {/* Posts results */}
        {mode === "posts" &&
          postResults.map((p) => (
            <Link
              key={p.id}
              href={`/post/${encodeURIComponent(p.id)}`}
              className="flex gap-3 rounded-2xl border border-gray-200 bg-white p-3 hover:bg-gray-50"
            >
              <div className="h-14 w-14 overflow-hidden rounded-xl border border-gray-200 bg-neutral-100">
                {p.mediaType === "image" ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={p.mediaDataUrl} alt="post" className="h-full w-full object-cover" />
                ) : (
                  <video className="h-full w-full object-cover">
                    <source src={p.mediaDataUrl} />
                  </video>
                )}
              </div>

              <div className="flex-1">
                <p className="text-sm font-semibold text-gray-900">{p.author}</p>
                <p className="text-xs text-gray-600 line-clamp-2">
                  {p.caption || <span className="text-gray-400">No caption</span>}
                </p>
                <p className="mt-1 text-[11px] text-gray-500">
                  {p.likesCount} likes • {p.commentsCount} comments
                </p>
              </div>
            </Link>
          ))}
      </div>
    </>
  );
}
