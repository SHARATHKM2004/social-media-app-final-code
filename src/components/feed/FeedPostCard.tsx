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
  return (
    <div className="rounded-2xl border border-gray-200 bg-white overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3">
        <div className="flex items-center gap-2">
          <div className="h-8 w-8 rounded-full bg-neutral-100 border border-gray-200 flex items-center justify-center">
            🙂
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
            alt="post"
            className="w-full max-h-[420px] object-contain bg-white"
          />
        ) : (
          <video controls className="w-full max-h-[420px] bg-black">
            <source src={post.mediaDataUrl} />
          </video>
        )}
      </div>

      {/* Content */}
      <div className="px-4 py-3">
        {post.caption ? <p className="text-sm text-gray-800">{post.caption}</p> : null}

        <div className="mt-3 flex items-center gap-4 text-sm">
          <button onClick={onLike} className="rounded-lg px-2 py-1 hover:bg-gray-100">
            ❤️ Like
          </button>

          <button
            onClick={onOpenComments}
            className="rounded-lg px-2 py-1 hover:bg-gray-100"
            disabled={!post.allowComments}
            title={!post.allowComments ? "Comments disabled" : "Comments"}
          >
            💬 Comment
          </button>

          <button
            onClick={onRepost}
            className="rounded-lg px-2 py-1 hover:bg-gray-100"
            disabled={!post.allowRepost}
            title={!post.allowRepost ? "Repost disabled" : "Repost"}
          >
            🔁 Repost
          </button>
        </div>

        <div className="mt-2 flex gap-4 text-xs text-gray-600">
          <button onClick={onShowLikes} className="hover:underline">
            {post.likes.length} likes
          </button>
          <button onClick={onOpenComments} className="hover:underline">
            {post.comments.length} comments
          </button>
          <button onClick={onShowReposts} className="hover:underline">
            {post.reposts.length} reposts
          </button>
        </div>
      </div>
    </div>
  );
}