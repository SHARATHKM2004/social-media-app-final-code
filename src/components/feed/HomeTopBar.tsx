"use client";

import Link from "next/link";

export default function HomeTopBar({
  unreadCount,
  onOpenNotifications,
}: {
  unreadCount: number;
  onOpenNotifications: () => void;
}) {
  const hasUnread = unreadCount > 0;

  return (
    <div className="flex items-center justify-between">
      <h2 className="text-lg font-bold text-gray-900">Home</h2>

      <div className="flex items-center gap-3">
        {/* ❤️ Notifications */}
        <button
          onClick={onOpenNotifications}
          className="relative flex h-10 w-10 items-center justify-center rounded-xl border border-gray-200 bg-white hover:bg-gray-50"
          aria-label="Notifications"
          title="Notifications"
        >
          <span className={`text-lg ${hasUnread ? "text-red-600" : "text-gray-700"}`}>
            {hasUnread ? "❤️" : "🤍"}
          </span>

          {hasUnread ? (
            <span className="absolute -right-1 -top-1 min-w-[18px] rounded-full bg-red-600 px-1.5 py-0.5 text-[10px] font-bold text-white">
              {unreadCount > 99 ? "99+" : unreadCount}
            </span>
          ) : null}
        </button>

        {/* 💬 Chats */}
        <Link
          href="/chats"
          className="flex h-10 w-10 items-center justify-center rounded-xl border border-gray-200 bg-white hover:bg-gray-50"
          aria-label="Chats"
          title="Chats"
        >
          <span className="text-lg">💬</span>
        </Link>
      </div>
    </div>
  );
}