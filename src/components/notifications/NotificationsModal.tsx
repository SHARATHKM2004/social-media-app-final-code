"use client";

import { useMemo } from "react";

export type NotificationType = "like" | "comment" | "repost";

export type NotificationItem = {
  id: string;
  toUser: string;
  fromUser: string;
  type: NotificationType;
  postId: string;
  commentText?: string;
  createdAt: string;
  read: boolean;
};

function timeAgo(iso: string) {
  const t = new Date(iso).getTime();
  const diff = Math.max(0, Date.now() - t);
  const s = Math.floor(diff / 1000);
  if (s < 60) return `${s}s ago`;
  const m = Math.floor(s / 60);
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  const d = Math.floor(h / 24);
  return `${d}d ago`;
}

export default function NotificationsModal({
  open,
  items,
  loading,
  onClose,
  onOpenItem,
  onMarkAllRead,
}: {
  open: boolean;
  items: NotificationItem[];
  loading: boolean;
  onClose: () => void;
  onOpenItem: (n: NotificationItem) => void;
  onMarkAllRead: () => void;
}) {
  const list = useMemo(() => items || [], [items]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="w-full max-w-md rounded-2xl bg-white shadow-soft overflow-hidden">
        <div className="flex items-center justify-between border-b border-gray-200 px-4 py-3">
          <p className="text-sm font-bold text-gray-900">Notifications</p>

          <div className="flex items-center gap-2">
            <button
              onClick={onMarkAllRead}
              className="rounded-xl border border-gray-200 bg-white px-3 py-2 text-xs font-semibold text-gray-700 hover:bg-gray-50"
            >
              Mark all read
            </button>

            <button
              onClick={onClose}
              className="rounded-xl bg-gray-900 px-3 py-2 text-xs font-semibold text-white hover:opacity-90"
            >
              Close
            </button>
          </div>
        </div>

        <div className="max-h-[70vh] overflow-auto">
          {loading ? (
            <p className="p-4 text-sm text-gray-600">Loading...</p>
          ) : list.length === 0 ? (
            <p className="p-4 text-sm text-gray-600">No notifications yet.</p>
          ) : (
            <div className="divide-y divide-gray-100">
              {list.map((n) => {
                const msg =
                  n.type === "like"
                    ? `Your post liked by ${n.fromUser}`
                    : n.type === "repost"
                    ? `Your post reshared by ${n.fromUser}`
                    : `Your post commented by ${n.fromUser}: "${n.commentText || ""}"`;

                return (
                  <button
                    key={n.id}
                    onClick={() => onOpenItem(n)}
                    className={`w-full text-left px-4 py-3 hover:bg-gray-50 ${
                      n.read ? "" : "bg-blue-50/40"
                    }`}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex-1">
                        <p className="text-sm text-gray-900">{msg}</p>
                        <p className="mt-1 text-xs text-gray-500">{timeAgo(n.createdAt)}</p>
                      </div>

                      {!n.read ? (
                        <span className="mt-1 inline-block h-2 w-2 rounded-full bg-brand-blue" />
                      ) : null}
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
