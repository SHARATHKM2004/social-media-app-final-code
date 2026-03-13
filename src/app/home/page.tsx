"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import BottomNav from "@/components/BottomNav";
import Link from "next/link";

type Post = {
  id: string;
  author: string;
  mediaType: "image" | "video";
  mediaDataUrl: string;
  caption: string;
  allowComments: boolean;
  allowRepost: boolean;
  createdAt: string;
  likes: string[];
  reposts: string[];
  comments: { id: string; username: string; text: string; createdAt: string }[];
};

type SearchUser = { username: string; avatarDataUrl: string };

function timeAgo(iso: string) {
  const diff = Date.now() - new Date(iso).getTime();
  const s = Math.floor(diff / 1000);
  if (s < 60) return `${s}s ago`;
  const m = Math.floor(s / 60);
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  const d = Math.floor(h / 24);
  return `${d}d ago`;
}

export default function HomePage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const tab = searchParams.get("tab") || "";
  const modal = searchParams.get("modal") || "";

  const currentUser = useMemo(() => localStorage.getItem("currentUser") || "", []);

  // FEED
  const [posts, setPosts] = useState<Post[]>([]);
  const [feedLoading, setFeedLoading] = useState(false);

  async function loadFeed() {
    setFeedLoading(true);
    try {
      const res = await fetch("/api/posts");
      const data = await res.json();
      if (res.ok) setPosts(data.posts || []);
    } finally {
      setFeedLoading(false);
    }
  }

  useEffect(() => {
    loadFeed();
  }, []);

  // EXPLORE SEARCH (your existing)
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchUser[]>([]);
  const [searchLoading, setSearchLoading] = useState(false);

  useEffect(() => {
    if (tab !== "explore") return;

    const t = setTimeout(async () => {
      const q = query.trim();
      if (!q) {
        setResults([]);
        return;
      }

      setSearchLoading(true);
      try {
        const res = await fetch(`/api/users/search?q=${encodeURIComponent(q)}`);
        const data = await res.json();
        if (res.ok) setResults(data.users || []);
        else setResults([]);
      } finally {
        setSearchLoading(false);
      }
    }, 300);

    return () => clearTimeout(t);
  }, [query, tab]);

  // CREATE MODAL STATE
  const [mediaDataUrl, setMediaDataUrl] = useState("");
  const [mediaType, setMediaType] = useState<"image" | "video">("image");
  const [caption, setCaption] = useState("");
  const [allowComments, setAllowComments] = useState(true);
  const [allowRepost, setAllowRepost] = useState(true);
  const [createError, setCreateError] = useState("");
  const [posting, setPosting] = useState(false);

  function closeCreateModal() {
    const params = new URLSearchParams(window.location.search);
    params.delete("modal");
    router.replace(`/home?${params.toString()}`.replace(/\?$/, ""));
    setMediaDataUrl("");
    setCaption("");
    setAllowComments(true);
    setAllowRepost(true);
    setCreateError("");
  }

  async function onPickMedia(file: File | null) {
    setCreateError("");
    if (!file) return;

    const isImage = file.type.startsWith("image/");
    const isVideo = file.type.startsWith("video/");

    if (!isImage && !isVideo) {
      setCreateError("Please upload an image or video.");
      return;
    }

    // limit to avoid huge json (learning)
    if (file.size > 8 * 1024 * 1024) {
      setCreateError("File too large. Please upload under 8MB (for now).");
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      const url = String(reader.result || "");
      setMediaDataUrl(url);
      setMediaType(isVideo ? "video" : "image");
    };
    reader.readAsDataURL(file);
  }

  async function createPost() {
    setCreateError("");
    if (!currentUser) {
      setCreateError("Please login again.");
      return;
    }
    if (!mediaDataUrl) {
      setCreateError("Please upload an image or video.");
      return;
    }

    setPosting(true);
    try {
      const res = await fetch("/api/posts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          author: currentUser,
          mediaType,
          mediaDataUrl,
          caption,
          allowComments,
          allowRepost,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        setCreateError(data?.error || "Failed to post.");
        setPosting(false);
        return;
      }

      await loadFeed(); // refresh feed
      closeCreateModal();
    } finally {
      setPosting(false);
    }
  }

  // LIKE / COMMENT / REPOST actions
  const [showList, setShowList] = useState<{ title: string; users: string[] } | null>(null);
  const [showComments, setShowComments] = useState<{ post: Post } | null>(null);
  const [commentText, setCommentText] = useState("");

  async function toggleLike(postId: string) {
    if (!currentUser) return;
    const res = await fetch(`/api/posts/${postId}/like`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username: currentUser }),
    });
    const data = await res.json();
    if (res.ok) {
      setPosts((prev) => prev.map((p) => (p.id === postId ? { ...p, likes: data.likes } : p)));
    }
  }

  async function toggleRepost(post: Post) {
    if (!currentUser) return;
    if (!post.allowRepost) return;

    const res = await fetch(`/api/posts/${post.id}/repost`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username: currentUser }),
    });
    const data = await res.json();
    if (res.ok) {
      setPosts((prev) => prev.map((p) => (p.id === post.id ? { ...p, reposts: data.reposts } : p)));
    }
  }

  async function addComment(post: Post) {
    if (!currentUser) return;
    if (!post.allowComments) return;
    const text = commentText.trim();
    if (!text) return;

    const res = await fetch(`/api/posts/${post.id}/comment`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username: currentUser, text }),
    });
    const data = await res.json();
    if (res.ok) {
      setPosts((prev) =>
        prev.map((p) => (p.id === post.id ? { ...p, comments: data.comments } : p))
      );
      setShowComments((s) => (s ? { post: { ...s.post, comments: data.comments } } : s));
      setCommentText("");
    }
  }

  return (
    <main className="min-h-screen bg-neutral-50 pb-16">
      <div className="mx-auto max-w-md p-5">
        <div className="rounded-3xl border-2 border-brand-blue bg-white p-5 shadow-soft">
          <h1 className="text-xl font-bold text-gray-900">Home</h1>

          {tab === "explore" ? (
            <>
              <p className="mt-1 text-sm text-gray-600">Explore — search users by name</p>
              <div className="mt-4">
                <input
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Search username..."
                  className="w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm outline-none focus:border-brand-blue focus:ring-2 focus:ring-brand-blue/20"
                />
              </div>

              <div className="mt-4 space-y-2">
                {searchLoading ? (
                  <p className="text-sm text-gray-600">Searching...</p>
                ) : results.length === 0 && query.trim() ? (
                  <p className="text-sm text-gray-600">No users found.</p>
                ) : null}

                {results.map((u) => (
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
                      <p className="text-xs text-gray-500">Tap to view profile</p>
                    </div>
                  </Link>
                ))}
              </div>
            </>
          ) : (
            <>
              <p className="mt-2 text-sm text-gray-600">Feed</p>

              <div className="mt-4 space-y-4">
                {feedLoading ? (
                  <p className="text-sm text-gray-600">Loading feed...</p>
                ) : posts.length === 0 ? (
                  <p className="text-sm text-gray-600">No posts yet. Create your first post ✅</p>
                ) : null}

                {posts.map((p) => (
                  <div key={p.id} className="rounded-2xl border border-gray-200 bg-white overflow-hidden">
                    <div className="flex items-center justify-between px-4 py-3">
                      <div className="flex items-center gap-2">
                        <div className="h-8 w-8 rounded-full bg-neutral-100 border border-gray-200 flex items-center justify-center">
                          🙂
                        </div>
                        <div>
                          <p className="text-sm font-semibold text-gray-900">{p.author}</p>
                          <p className="text-xs text-gray-500">{timeAgo(p.createdAt)}</p>
                        </div>
                      </div>
                    </div>

                    <div className="bg-black">
                      {p.mediaType === "image" ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={p.mediaDataUrl} alt="post" className="w-full max-h-[420px] object-contain bg-white" />
                      ) : (
                        <video controls className="w-full max-h-[420px] bg-black">
                          <source src={p.mediaDataUrl} />
                        </video>
                      )}
                    </div>

                    <div className="px-4 py-3">
                      {p.caption ? <p className="text-sm text-gray-800">{p.caption}</p> : null}

                      <div className="mt-3 flex items-center gap-4 text-sm">
                        <button
                          onClick={() => toggleLike(p.id)}
                          className="rounded-lg px-2 py-1 hover:bg-gray-100"
                        >
                          ❤️ Like
                        </button>

                        <button
                          onClick={() => setShowComments({ post: p })}
                          className="rounded-lg px-2 py-1 hover:bg-gray-100"
                          disabled={!p.allowComments}
                          title={!p.allowComments ? "Comments disabled" : "Comments"}
                        >
                          💬 Comment
                        </button>

                        <button
                          onClick={() => toggleRepost(p)}
                          className="rounded-lg px-2 py-1 hover:bg-gray-100"
                          disabled={!p.allowRepost}
                          title={!p.allowRepost ? "Repost disabled" : "Repost"}
                        >
                          🔁 Repost
                        </button>
                      </div>

                      <div className="mt-2 flex gap-4 text-xs text-gray-600">
                        <button onClick={() => setShowList({ title: "Liked by", users: p.likes })} className="hover:underline">
                          {p.likes.length} likes
                        </button>
                        <button onClick={() => setShowComments({ post: p })} className="hover:underline">
                          {p.comments.length} comments
                        </button>
                        <button onClick={() => setShowList({ title: "Reposted by", users: p.reposts })} className="hover:underline">
                          {p.reposts.length} reposts
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      </div>

      <BottomNav />

      {/* Create Post Modal */}
      {modal === "create" && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-md rounded-2xl bg-white p-5 shadow-soft">
            <h2 className="text-lg font-semibold text-gray-900">Create Post</h2>
            <p className="mt-1 text-xs text-gray-600">Upload an image/video and add a caption</p>

            <div className="mt-4 space-y-3">
              <div>
                <label className="mb-1 block text-xs font-semibold text-gray-600">Upload</label>
                <input
                  type="file"
                  accept="image/*,video/*"
                  onChange={(e) => onPickMedia(e.target.files?.[0] || null)}
                  className="w-full rounded-xl border border-gray-200 bg-white px-3 py-2 text-sm"
                />
              </div>

              {mediaDataUrl ? (
                <div className="rounded-2xl border border-gray-200 overflow-hidden">
                  {mediaType === "image" ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={mediaDataUrl} alt="preview" className="w-full max-h-[240px] object-contain bg-white" />
                  ) : (
                    <video controls className="w-full max-h-[240px] bg-black">
                      <source src={mediaDataUrl} />
                    </video>
                  )}
                </div>
              ) : null}

              <div>
                <label className="mb-1 block text-xs font-semibold text-gray-600">Caption</label>
                <input
                  value={caption}
                  onChange={(e) => setCaption(e.target.value)}
                  placeholder="Write a caption..."
                  className="w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm outline-none focus:border-brand-blue focus:ring-2 focus:ring-brand-blue/20"
                />
              </div>

              <div className="flex items-center gap-3">
                <label className="flex items-center gap-2 text-sm text-gray-700">
                  <input
                    type="checkbox"
                    checked={allowComments}
                    onChange={(e) => setAllowComments(e.target.checked)}
                  />
                  Allow comments
                </label>

                <label className="flex items-center gap-2 text-sm text-gray-700">
                  <input
                    type="checkbox"
                    checked={allowRepost}
                    onChange={(e) => setAllowRepost(e.target.checked)}
                  />
                  Allow repost
                </label>
              </div>

              {createError ? <p className="text-sm text-red-600">{createError}</p> : null}

              <div className="mt-2 flex gap-3">
                <button
                  onClick={closeCreateModal}
                  className="flex-1 rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm font-semibold text-gray-700 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  onClick={createPost}
                  disabled={posting}
                  className="flex-1 rounded-xl bg-brand-blue px-4 py-3 text-sm font-semibold text-white hover:opacity-95 disabled:opacity-60"
                >
                  {posting ? "Posting..." : "Post"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* List Modal (likes/reposts) */}
      {showList && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-sm rounded-2xl bg-white p-5 shadow-soft">
            <h2 className="text-lg font-semibold text-gray-900">{showList.title}</h2>

            <div className="mt-4 max-h-72 overflow-auto space-y-2">
              {showList.users.length === 0 ? (
                <p className="text-sm text-gray-600">No users yet.</p>
              ) : (
                showList.users.map((u) => (
                  <div key={u} className="rounded-xl border border-gray-200 px-3 py-2 text-sm text-gray-800">
                    {u}
                  </div>
                ))
              )}
            </div>

            <button
              onClick={() => setShowList(null)}
              className="mt-4 w-full rounded-xl bg-brand-blue px-4 py-3 text-sm font-semibold text-white hover:opacity-95"
            >
              Close
            </button>
          </div>
        </div>
      )}

      {/* Comments Modal */}
      {showComments && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-md rounded-2xl bg-white p-5 shadow-soft">
            <h2 className="text-lg font-semibold text-gray-900">Comments</h2>

            <div className="mt-4 max-h-72 overflow-auto space-y-2">
              {showComments.post.comments.length === 0 ? (
                <p className="text-sm text-gray-600">No comments yet.</p>
              ) : (
                showComments.post.comments.map((c) => (
                  <div key={c.id} className="rounded-xl border border-gray-200 p-3">
                    <p className="text-sm font-semibold text-gray-900">{c.username}</p>
                    <p className="text-sm text-gray-700">{c.text}</p>
                    <p className="mt-1 text-xs text-gray-500">{timeAgo(c.createdAt)}</p>
                  </div>
                ))
              )}
            </div>

            {showComments.post.allowComments ? (
              <div className="mt-4 flex gap-2">
                <input
                  value={commentText}
                  onChange={(e) => setCommentText(e.target.value)}
                  placeholder="Write a comment..."
                  className="flex-1 rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm outline-none focus:border-brand-blue focus:ring-2 focus:ring-brand-blue/20"
                />
                <button
                  onClick={() => addComment(showComments.post)}
                  className="rounded-xl bg-brand-blue px-4 py-3 text-sm font-semibold text-white hover:opacity-95"
                >
                  Send
                </button>
              </div>
            ) : (
              <p className="mt-4 text-sm text-gray-600">Comments are disabled for this post.</p>
            )}

            <button
              onClick={() => setShowComments(null)}
              className="mt-4 w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm font-semibold text-gray-700 hover:bg-gray-50"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </main>
  );
}
