"use client";

import { useEffect } from "react";

export default function PostOptionsMenu({
  postId,
  isOpen,
  onToggle,
  onClose,
}: {
  postId: string;
  isOpen: boolean;
  onToggle: () => void;
  onClose: () => void;
}) {
  useEffect(() => {
    function close() {
      onClose();
    }
    if (isOpen) window.addEventListener("click", close);
    return () => window.removeEventListener("click", close);
  }, [isOpen, onClose]);

  async function copyPostLink() {
    const link = `${window.location.origin}/post/${postId}`;
    await navigator.clipboard.writeText(link);
    onClose();
  }

  async function sharePost() {
    const link = `${window.location.origin}/post/${postId}`;
    onClose();
    try {
      if (navigator.share) {
        await navigator.share({ title: "Post", text: "Check this post", url: link });
      } else {
        await navigator.clipboard.writeText(link);
      }
    } catch {
      // ignore
    }
  }

  return (
    <div className="relative" onClick={(e) => e.stopPropagation()}>
      <button
        onClick={onToggle}
        className="rounded-lg px-2 py-1 text-lg hover:bg-gray-100"
        title="Options"
        aria-label="Options"
      >
        ⋯
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-44 overflow-hidden rounded-xl border border-gray-200 bg-white shadow-soft z-20">
          <button
            onClick={copyPostLink}
            className="w-full px-4 py-3 text-left text-sm hover:bg-gray-50"
          >
            Copy link to post
          </button>

          <button
            onClick={sharePost}
            className="w-full px-4 py-3 text-left text-sm hover:bg-gray-50"
          >
            Share post
          </button>

          <button
            onClick={() => {
              onClose();
              alert("Reported (placeholder).");
            }}
            className="w-full px-4 py-3 text-left text-sm text-red-600 hover:bg-red-50"
          >
            Report post
          </button>
        </div>
      )}
    </div>
  );
}