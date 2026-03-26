"use client";

import { useState } from "react";
import { Post } from "@/types/post";
import { timeAgo } from "@/lib/client/time";

export default function CommentsModal({
  post,
  onClose,
  onSend,
}: {
  post: Post;
  onClose: () => void;
  onSend: (text: string) => Promise<void>;
}) {
  const [text, setText] = useState("");

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="w-full max-w-md rounded-2xl bg-white p-5 shadow-soft">
        <h2 className="text-lg font-semibold text-gray-900">Comments</h2>

        <div className="mt-4 max-h-72 overflow-auto space-y-2">
          {post.comments.length === 0 ? (
            <p className="text-sm text-gray-600">No comments yet.</p>
          ) : (
            post.comments.map((c) => (
              <div key={c.id} className="rounded-xl border border-gray-200 p-3">
                <p className="text-sm font-semibold text-gray-900">{c.username}</p>
                <p className="text-sm text-gray-700">{c.text}</p>
                <p className="mt-1 text-xs text-gray-500">{timeAgo(c.createdAt)}</p>
              </div>
            ))
          )}
        </div>

        {post.allowComments ? (
          <div className="mt-4 flex gap-2">
            <input
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="Write a comment..."
              className="flex-1 rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm outline-none focus:border-brand-blue focus:ring-2 focus:ring-brand-blue/20"
            />
            <button
              onClick={async () => {
                const t = text.trim();
                if (!t) return;
                await onSend(t);
                setText("");
              }}
              className="rounded-xl bg-brand-blue px-4 py-3 text-sm font-semibold text-white hover:opacity-95"
            >
              Send
            </button>
          </div>
        ) : (
          <p className="mt-4 text-sm text-gray-600">Comments are disabled for this post.</p>
        )}

        <button
          onClick={onClose}
          className="mt-4 w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm font-semibold text-gray-700 hover:bg-gray-50"
        >
          Close
        </button>
      </div>
    </div>
  );
}