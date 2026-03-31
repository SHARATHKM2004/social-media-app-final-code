"use client";

import Link from "next/link";

export default function HomeTopBar({
  unreadCount,
  onOpenNotifications,
  chatUnreadCount,
}: {
  unreadCount: number;
  onOpenNotifications: () => void;
  chatUnreadCount: number;
}) {
  const hasNotifUnread = unreadCount > 0;
  const hasChatUnread = chatUnreadCount > 0;

  return (
    <div className="flex items-center justify-between">
      <h3 className="text-lg font-bold text-gray-900">Home</h3>

      <div className="flex items-center gap-3">
        {/* ❤️ Notifications */}
        <button
          onClick={onOpenNotifications}
          className="relative flex h-10 w-10 items-center justify-center rounded-xl border border-gray-200 bg-white hover:bg-gray-50"
          aria-label="Notifications"
        >
          <span className={`text-lg ${hasNotifUnread ? "text-red-600" : "text-gray-700"}`}>
            {hasNotifUnread ? "❤️" : "🤍"}
          </span>

          {hasNotifUnread ? (
            <span className="absolute -right-1 -top-1 min-w-[18px] rounded-full bg-red-600 px-1.5 py-0.5 text-[10px] font-bold text-white">
              {unreadCount > 99 ? "99+" : unreadCount}
            </span>
          ) : null}
        </button>

        {/* 💬 Chats */}
        <Link
          href="/chats"
          className="relative flex h-10 w-10 items-center justify-center rounded-xl border border-gray-200 bg-white hover:bg-gray-50"
          aria-label="Chats"
        >
          <span className="text-lg text-gray-700">💬</span>

          {hasChatUnread ? (
            <span className="absolute -right-1 -top-1 min-w-[18px] rounded-full bg-brand-blue px-1.5 py-0.5 text-[10px] font-bold text-white">
              {chatUnreadCount > 99 ? "99+" : chatUnreadCount}
            </span>
          ) : null}
        </Link>
      </div>
    </div>
  );
}