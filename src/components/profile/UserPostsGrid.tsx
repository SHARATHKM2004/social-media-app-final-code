"use client";

import { Post } from "@/types/post";

export default function UserPostsGrid({
  posts,
  canDelete,
  onDelete,
}: {
  posts: Post[];
  canDelete: boolean;
  onDelete: (postId: string) => void;
}) {
  return (
    <div className="mt-5">
      <h3 className="text-sm font-semibold text-gray-900">Posts</h3>

      {posts.length === 0 ? (
        <p className="mt-2 text-sm text-gray-600">No posts yet.</p>
      ) : (
        <div className="mt-3 grid grid-cols-3 gap-2">
          {posts.map((p) => (
            <div
              key={p.id}
              className="relative aspect-square overflow-hidden rounded-xl border border-gray-200 bg-neutral-100"
            >
              {p.mediaType === "image" ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={p.mediaDataUrl} alt="post" className="h-full w-full object-cover" />
              ) : (
                <video className="h-full w-full object-cover">
                  <source src={p.mediaDataUrl} />
                </video>
              )}

              {/* ✅ Delete button only if allowed */}
              {canDelete ? (
                <button
                  onClick={() => onDelete(p.id)}
                  className="absolute right-1 top-1 rounded-lg bg-black/60 px-2 py-1 text-xs font-semibold text-white hover:bg-black/75"
                  title="Delete post"
                >
                  🗑
                </button>
              ) : null}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}