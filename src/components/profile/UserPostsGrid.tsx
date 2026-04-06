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
    <div className="mt-4">
      <h3 className="text-sm font-semibold text-gray-900">Posts</h3>

      {posts.length === 0 ? (
        <p className="mt-2 text-sm text-gray-600">No posts yet.</p>
      ) : (
        <div className="mt-3 grid grid-cols-3 gap-2">
          {posts.map((p) => {
            const hasMedia = p.hasMedia !== false; // default true

            // ✅ If base64 present, use it (fallback)
            // ✅ Otherwise load through streaming endpoint (fast + cached)
            const src =
              hasMedia && p.mediaDataUrl?.startsWith("data:")
                ? p.mediaDataUrl
                : hasMedia
                ? `/api/media/post/${encodeURIComponent(p.id)}`
                : "";

            return (
              <div
                key={p.id}
                className="relative aspect-square overflow-hidden rounded-xl border border-gray-200 bg-gray-50"
              >
                {!hasMedia ? (
                  <div className="flex h-full w-full items-center justify-center text-xs text-gray-500">
                    No media
                  </div>
                ) : p.mediaType === "image" ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={src}
                    alt="post"
                    className="h-full w-full object-cover"
                    loading="lazy"
                    decoding="async"
                  />
                ) : (
                  // eslint-disable-next-line @next/next/no-img-element
                  <video
                    src={src}
                    className="h-full w-full object-cover"
                    controls
                    preload="none"
                  />
                )}

                {canDelete ? (
                  <button
                    onClick={() => onDelete(p.id)}
                    className="absolute right-1 top-1 rounded-lg bg-black/60 px-2 py-1 text-xs font-semibold text-white hover:bg-black/75"
                    title="Delete post"
                    type="button"
                  >
                    🗑
                  </button>
                ) : null}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}