"use client";

import { useEffect, useRef, useState } from "react";
import { Post } from "@/types/post";
import { timeAgo } from "@/lib/client/time";
import PostOptionsMenu from "./PostOptionsMenu";

type PostWithAvatar = Post & {
  authorAvatarDataUrl?: string;
  authorAvatar?: string;
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

  
  const p = post as PostWithAvatar;
  const authorAvatarDataUrl = p.authorAvatarDataUrl || p.authorAvatar || "";

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
      { rootMargin: "300px 0px" } // start a bit earlier
    );

    io.observe(el);
    return () => io.disconnect();
  }, []);

  const shouldShowMedia = inView && !deferMedia;

  return (
    <div className="rounded-2xl border border-gray-200 bg-white overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3">
        <div className="flex items-center gap-2">
          <div className="h-8 w-8 rounded-full bg-neutral-100 border border-gray-200 overflow-hidden flex items-center justify-center">
            {authorAvatarDataUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={authorAvatarDataUrl}
                alt="avatar"
                width={32}
                height={32}
                className="h-full w-full object-cover"
              />
            ) : (
              <span>🙂</span>
            )}
          </div>

          <div>
            <p className="text-sm font-semibold text-gray-900">{post.author}</p>
            <p className="text-xs text-gray-500">{timeAgo(post.createdAt)}</p>
          </div>
        </div>

        <PostOptionsMenu
          postId={post.id}
          isOpen={postMenuOpen}
          onToggle={onToggleMenu}
          onClose={onCloseMenu}
        />
      </div>

      {/* Media (✅ stable layout: placeholder and real media share SAME fixed box) */}
      <div ref={mediaHostRef} className="relative w-full aspect-square bg-black">
        {!shouldShowMedia ? (
          <div className="absolute inset-0 bg-gray-200 animate-pulse" />
        ) : post.mediaType === "image" ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={post.mediaDataUrl}
            alt="post"
            width={800}
            height={800}
            loading="lazy"
            decoding="async"
            className="absolute inset-0 h-full w-full object-cover"
          />
        ) : (
          <video
            className="absolute inset-0 h-full w-full object-cover"
            controls
            preload="none"
            playsInline
          >
            <source src={post.mediaDataUrl} />
          </video>
        )}
      </div>

      {/* Content */}
      <div className="px-4 py-3">
        {post.caption ? (
          <p className="text-sm text-gray-900 whitespace-pre-wrap">{post.caption}</p>
        ) : null}

        <div className="mt-3 flex items-center justify-between text-sm">
          <button onClick={onLike} className="text-gray-700 hover:text-gray-900">
            ❤️ Like
          </button>
          <button onClick={onOpenComments} className="text-gray-700 hover:text-gray-900">
            💬 Comment
          </button>
          <button onClick={onRepost} className="text-gray-700 hover:text-gray-900">
            🔁 Repost
          </button>
        </div>

        <div className="mt-2 flex gap-4 text-xs text-gray-600">
          <button onClick={onShowLikes} className="hover:underline">
            {post.likes.length} likes
          </button>
          <span>{post.comments.length} comments</span>
          <button onClick={onShowReposts} className="hover:underline">
            {post.reposts.length} reposts
          </button>
        </div>
      </div>
    </div>
  );
}
