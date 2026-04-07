"use client";

import { useEffect, useRef, useState } from "react";
import { Post } from "@/types/post";
import { timeAgo } from "@/lib/client/time";
import PostOptionsMenu from "./PostOptionsMenu";

type PostWithExtras = Post & {
  authorAvatarDataUrl?: string;
  authorAvatar?: string;
  _id?: string;

  mediaDataUrl?: string;
  mediaType?: "image" | "video";
  hasMedia?: boolean;
};

function safeIso(input: unknown): string | null {
  if (!input) return null;
  if (input instanceof Date) {
    const t = input.getTime();
    return Number.isFinite(t) ? input.toISOString() : null;
  }
  const d = new Date(String(input));
  const t = d.getTime();
  if (!Number.isFinite(t)) return null;
  return d.toISOString();
}

export default function FeedPostCard({
  post,
  postMenuOpen,
  onToggleMenu,
  onCloseMenu,
  onLike,
  onOpenComments,
  onRepost,
  onShowLikes,
  onShowReposts,
  deferMedia = false,
  priority = false,
}: {
  post: Post;
  postMenuOpen: boolean;
  onToggleMenu: () => void;
  onCloseMenu: () => void;
  onLike: () => void;
  onOpenComments: () => void;
  onRepost: () => void;
  onShowLikes: () => void;
  onShowReposts: () => void;
  deferMedia?: boolean;
  priority?: boolean;
}) {
  const p = post as PostWithExtras;

  const authorAvatarDataUrl = p.authorAvatarDataUrl || p.authorAvatar || "";
  const postId = (post as any).id ?? p._id ?? "";

  const rawMedia = (p.mediaDataUrl ?? "") as string;
  const hasMedia = p.hasMedia !== undefined ? p.hasMedia : !!rawMedia;

  const mediaSrc =
    hasMedia && postId ? `/api/media/post/${encodeURIComponent(postId)}` : "";

  const createdIso = safeIso((post as any).createdAt);

  const mediaHostRef = useRef<HTMLDivElement | null>(null);
  const [inView, setInView] = useState(false);

  useEffect(() => {
    if (priority) return;

    const el = mediaHostRef.current;
    if (!el) return;

    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setInView(true);
          io.disconnect();
        }
      },
      { rootMargin: "300px 0px" }
    );

    io.observe(el);
    return () => io.disconnect();
  }, [priority]);

  const shouldShowMedia = (priority || inView) && !deferMedia;

  return (
    <div className="w-full rounded-xl border border-gray-200 bg-white p-3">
      {/* Header */}
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          {authorAvatarDataUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={authorAvatarDataUrl}
              alt="avatar"
              className="h-9 w-9 rounded-full object-cover"
              loading="lazy"
              decoding="async"
            />
          ) : (
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-gray-100">
              🙂
            </div>
          )}

          <div className="leading-tight">
            <div className="font-semibold text-gray-900">{post.author}</div>

            {/* ✅ FIX: visible color on white background */}
            <div className="text-xs text-gray-500">
              {createdIso ? timeAgo(createdIso) : "just now"}
            </div>
          </div>
        </div>

        <PostOptionsMenu
          postId={String(postId)}
          isOpen={postMenuOpen}
          onToggle={onToggleMenu}
          onClose={onCloseMenu}
        />
      </div>

      {/* Media */}
      <div
        ref={mediaHostRef}
        className="relative mt-3 w-full overflow-hidden rounded-lg bg-black/10"
        style={{ aspectRatio: "1 / 1" }}
      >
        {!shouldShowMedia || !mediaSrc ? (
          <div className="absolute inset-0 animate-pulse bg-black/5" />
        ) : p.mediaType === "image" ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={mediaSrc}
            alt="post"
            className="absolute inset-0 h-full w-full object-cover"
            decoding="async"
            loading={priority ? "eager" : "lazy"}
            data-fetchpriority={priority ? "high" : "auto"}
          />
        ) : (
          <video
            className="absolute inset-0 h-full w-full object-cover"
            controls
            playsInline
            preload={priority ? "auto" : "metadata"}
          >
            <source src={mediaSrc} />
          </video>
        )}
      </div>

      {/* Content */}
      {post.caption ? (
        <div className="mt-3 whitespace-pre-wrap text-sm text-gray-900">
          {post.caption}
        </div>
      ) : null}

      {/* Actions */}
      <div className="mt-3 flex items-center gap-4 text-sm text-gray-800">
        <button onClick={onLike} className="hover:opacity-80">
          ❤️ Like
        </button>
        <button onClick={onOpenComments} className="hover:opacity-80">
          💬 Comment
        </button>
        <button onClick={onRepost} className="hover:opacity-80">
          🔁 Repost
        </button>
      </div>

      <div className="mt-2 flex items-center gap-3 text-xs text-gray-600">
        <button onClick={onShowLikes} className="hover:opacity-80">
          {post.likes.length} likes
        </button>
        <span>{post.comments.length} comments</span>
        <button onClick={onShowReposts} className="hover:opacity-80">
          {post.reposts.length} reposts
        </button>
      </div>
    </div>
  );
}
