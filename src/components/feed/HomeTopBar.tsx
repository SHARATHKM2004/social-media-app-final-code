"use client";

import Link from "next/link";

export default function HomeTopBar() {
  return (
    <div className="flex items-center justify-between">
      <h1 className="text-xl font-bold text-gray-900">Home</h1>

      <Link
        href="/chats"
        className="rounded-xl p-2 text-gray-700 hover:bg-gray-100"
        title="Chats"
        aria-label="Chats"
      >
        💬
      </Link>
    </div>
  );
}