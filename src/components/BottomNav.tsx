"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

function NavItem({
  href,
  label,
  icon,
}: {
  href: string;
  label: string;
  icon: React.ReactNode;
}) {
  const pathname = usePathname();
  const active = pathname === href;

  return (
    <Link
      href={href}
      className={`flex flex-col items-center justify-center gap-1 py-2 text-xs ${
        active ? "text-brand-blue" : "text-gray-500"
      }`}
    >
      <div className={`${active ? "text-brand-blue" : "text-gray-600"}`}>{icon}</div>
      <span className={active ? "font-semibold" : ""}>{label}</span>
    </Link>
  );
}

export default function BottomNav() {
  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 border-t border-gray-200 bg-white">
      <div className="mx-auto grid max-w-md grid-cols-5 px-2">
        <NavItem
          href="/home"
          label="Home"
          icon={
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
              <path d="M3 10.5 12 3l9 7.5V21a1 1 0 0 1-1 1h-5v-7H9v7H4a1 1 0 0 1-1-1v-10.5Z" stroke="currentColor" strokeWidth="1.8" />
            </svg>
          }
        />
        <NavItem
          href="/reels"
          label="Reels"
          icon={
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
              <path d="M4 7a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V7Z" stroke="currentColor" strokeWidth="1.8" />
              <path d="M10 9l5 3-5 3V9Z" fill="currentColor" />
            </svg>
          }
        />
        <NavItem
          href="/home?modal=create"
          label="Post"
          icon={
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
              <path d="M12 5v14M5 12h14" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
            </svg>
          }
        />
        <NavItem
          href="/home?tab=explore"
          label="Explore"
          icon={
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
              <path d="M21 21l-4.3-4.3" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
              <circle cx="11" cy="11" r="7" stroke="currentColor" strokeWidth="2" />
            </svg>
          }
        />
        <NavItem
          href="/profile"
          label="Profile"
          icon={
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
              <path d="M20 21a8 8 0 1 0-16 0" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
              <circle cx="12" cy="8" r="4" stroke="currentColor" strokeWidth="2" />
            </svg>
          }
        />
      </div>
    </nav>
  );
}