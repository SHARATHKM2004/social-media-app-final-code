"use client";

import { Post } from "@/types/post";
import { timeAgo } from "@/lib/client/time";
import PostOptionsMenu from "./PostOptionsMenu";

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
}) {
  // Backward-safe: in case old posts don't have this field yet
  const authorAvatarDataUrl =
    (post as any).authorAvatarDataUrl ||
    (post as any).authorAvatar ||
    "";

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
                alt={`${post.author} avatar`}
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

      {/* Media */}
      <div className="bg-black">
        {post.mediaType === "image" ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={post.mediaDataUrl}
            alt="post media"
            className="w-full object-cover"
          />
        ) : (
          <video className="w-full" controls>
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
