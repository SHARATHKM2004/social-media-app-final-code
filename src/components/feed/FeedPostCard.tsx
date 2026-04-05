"use client";

import { useEffect, useRef, useState } from "react";
import { Post } from "@/types/post";
import { timeAgo } from "@/lib/client/time";
import PostOptionsMenu from "./PostOptionsMenu";

type PostWithExtras = Post & {
  authorAvatarDataUrl?: string;
  authorAvatar?: string;
  _id?: string;
  // in your types you have: mediaDataUrl, mediaType
  mediaDataUrl?: string;
  mediaType?: "image" | "video";
};

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
}) {
  const p = post as PostWithExtras;

  // Avatar can be base64 or normal url
  const authorAvatarDataUrl = p.authorAvatarDataUrl || p.authorAvatar || "";

  // Your Post type screenshot shows id:string, so use post.id primarily
  const postId = (post as any).id ?? p._id ?? "";

  // Your Post type uses mediaDataUrl (base64)
  const rawMedia = (p.mediaDataUrl ?? "") as string;

  // ✅ If base64, load via API route (binary + cached)
  const mediaSrc =
    rawMedia.startsWith("data:") && postId
      ? `/api/media/post/${postId}`
      : rawMedia;

  // ✅ Only load media when card is near viewport AND deferMedia window has passed
  const mediaHostRef = useRef<HTMLDivElement | null>(null);
  const [inView, setInView] = useState(false);

  useEffect(() => {
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
  }, []);

  const shouldShowMedia = inView && !deferMedia;

  return (
    <div className="w-full rounded-xl border border-white/10 bg-white/5 p-3">
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
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-white/10">
              🙂
            </div>
          )}

          <div className="leading-tight">
            <div className="font-semibold">{post.author}</div>
            <div className="text-xs text-white/60">{timeAgo(post.createdAt)}</div>
          </div>
        </div>

        {/* ✅ FIX: PostOptionsMenu expects isOpen (not open) + pass postId */}
        <PostOptionsMenu
          postId={postId}
          isOpen={postMenuOpen}
          onToggle={onToggleMenu}
          onClose={onCloseMenu}
        />
      </div>

      {/* Media (stable layout placeholder) */}
      <div
        ref={mediaHostRef}
        className="relative mt-3 w-full overflow-hidden rounded-lg bg-black/20"
        style={{ aspectRatio: "1 / 1" }}
      >
        {!shouldShowMedia ? (
          <div className="absolute inset-0 animate-pulse bg-white/5" />
        ) : p.mediaType === "image" ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={mediaSrc}
            alt="post"
            className="absolute inset-0 h-full w-full object-cover"
            loading="lazy"
            decoding="async"
          />
        ) : (
          <video
            src={mediaSrc}
            className="absolute inset-0 h-full w-full object-cover"
            controls
            playsInline
            preload="metadata"
          />
        )}
      </div>

      {/* Content */}
      {post.caption ? (
        <div className="mt-3 whitespace-pre-wrap text-sm">{post.caption}</div>
      ) : null}

      {/* Actions */}
      <div className="mt-3 flex items-center gap-4 text-sm">
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

      <div className="mt-2 flex items-center gap-3 text-xs text-white/70">
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
