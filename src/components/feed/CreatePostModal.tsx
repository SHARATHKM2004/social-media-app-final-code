"use client";

import { useEffect, useState } from "react";

export default function CreatePostModal({
  open,
  currentUser,
  onClose,
  onPosted,
}: {
  open: boolean;
  currentUser: string;
  onClose: () => void;
  onPosted: () => Promise<void>;
}) {
  const [mediaDataUrl, setMediaDataUrl] = useState("");
  const [mediaType, setMediaType] = useState<"image" | "video">("image");
  const [caption, setCaption] = useState("");
  const [allowComments, setAllowComments] = useState(true);
  const [allowRepost, setAllowRepost] = useState(true);
  const [createError, setCreateError] = useState("");
  const [posting, setPosting] = useState(false);

  // ✅ NEW
  const [successMsg, setSuccessMsg] = useState("");

  useEffect(() => {
    if (!open) return;

    // reset every time modal opens
    setMediaDataUrl("");
    setMediaType("image");
    setCaption("");
    setAllowComments(true);
    setAllowRepost(true);
    setCreateError("");
    setPosting(false);

    // ✅ NEW
    setSuccessMsg("");
  }, [open]);

  async function onPickMedia(file: File | null) {
    setCreateError("");
    if (!file) return;

    const isImage = file.type.startsWith("image/");
    const isVideo = file.type.startsWith("video/");

    if (!isImage && !isVideo) {
      setCreateError("Please upload an image or video.");
      return;
    }

    // avoid huge JSON (for now)
    if (file.size > 8 * 1024 * 1024) {
      setCreateError("File too large. Please upload under 8MB (for now).");
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      const url = String(reader.result ?? "");
      setMediaDataUrl(url);
      setMediaType(isVideo ? "video" : "image");
    };
    reader.readAsDataURL(file);
  }

  async function createPost() {
    setCreateError("");
    setSuccessMsg("");

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
        return;
      }

      await onPosted(); // refresh feed

      // ✅ NEW: show popup message then close quickly
      setSuccessMsg("Post created.");
      setTimeout(() => {
        onClose(); // close modal
      }, 800);
    } finally {
      setPosting(false);
    }
  }

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="relative w-full max-w-md rounded-2xl bg-white p-5 shadow-soft">
        {/* ✅ Success popup (same modal place) */}
        {successMsg ? (
          <div className="absolute left-1/2 top-3 -translate-x-1/2 rounded-xl bg-green-600 px-4 py-2 text-sm font-semibold text-white shadow">
            {successMsg}
          </div>
        ) : null}

        <h2 className="text-lg font-semibold text-gray-900">Create Post</h2>
        <p className="mt-1 text-xs text-gray-600">Upload an image/video and add a caption</p>

        <div className="mt-4 space-y-3">
          <div>
            <label className="mb-1 block text-xs font-semibold text-gray-600">Upload</label>
            <input
              type="file"
              aria-label="Upload media"
              accept="image/*,video/*"
              onChange={(e) => onPickMedia(e.target.files?.[0] || null)}
              className="w-full rounded-xl border border-gray-200 bg-white px-3 py-2 text-sm"
            />
          </div>

          {mediaDataUrl ? (
            <div className="rounded-2xl border border-gray-200 overflow-hidden">
              {mediaType === "image" ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={mediaDataUrl}
                  alt="preview"
                  className="w-full max-h-[240px] object-contain bg-white"
                />
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
              onClick={onClose}
              disabled={posting}
              className="flex-1 rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm font-semibold text-gray-700 hover:bg-gray-50 disabled:opacity-60"
            >
              Cancel
            </button>

            <button
              onClick={createPost}
              disabled={posting || !!successMsg}
              className="flex-1 rounded-xl bg-brand-blue px-4 py-3 text-sm font-semibold text-white hover:opacity-95 disabled:opacity-60"
            >
              {posting ? "Posting..." : successMsg ? "Done" : "Post"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
