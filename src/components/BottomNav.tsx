"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

function Item({
  href,
  label,
  icon,
  active,
}: {
  href: string;
  label: string;
  icon: React.ReactNode;
  active: boolean;
}) {
  return (
    <Link
      href={href}
      className={`flex flex-col items-center gap-1 text-xs font-semibold ${
        active ? "text-brand-blue" : "text-gray-600"
      }`}
    >
      <span className="text-xl">{icon}</span>
      <span>{label}</span>
    </Link>
  );
}

export default function BottomNav({
  notifUnreadCount = 0,
}: {
  notifUnreadCount?: number;
}) {
  const pathname = usePathname();

  const isHome = pathname === "/home";
  const isExplore = pathname === "/explore";
  const isProfile = pathname === "/profile";

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 border-t border-gray-200 bg-white">
      <div className="mx-auto flex max-w-md items-center justify-between px-6 py-2">
        <Item href="/home" label="Home" icon="🏠" active={isHome} />

        <Item href="/explore" label="Explore" icon="🔎" active={isExplore} />

        {/* ✅ Create Post (restored) — uses /home?modal=create flow */}
        <Link
          href="/home?modal=create"
          className="flex flex-col items-center gap-1 text-xs font-semibold text-gray-600"
          aria-label="Create post"
          title="Create post"
        >
          <span className="rounded-full bg-brand-blue px-3 py-1 text-xl text-white">
            ＋
          </span>
          <span>Create</span>
        </Link>

        {/* ✅ Alerts (Notifications) with unread badge */}
        <button
          type="button"
          onClick={() => window.dispatchEvent(new CustomEvent("open-notifications"))}
          className={`relative flex flex-col items-center gap-1 text-xs font-semibold ${
            isHome ? "text-gray-600" : "text-gray-600"
          }`}
          aria-label="Open notifications"
          title="Notifications"
        >
          <span className="text-xl">🔔</span>
          <span>Alerts</span>

          {notifUnreadCount > 0 && (
            <span className="absolute -top-1 right-2 rounded-full bg-red-600 px-1 text-[10px] font-bold text-white">
              {notifUnreadCount > 99 ? "99+" : notifUnreadCount}
            </span>
          )}
        </button>

        <Item href="/profile" label="Profile" icon="👤" active={isProfile} />
      </div>
    </nav>
  );
}