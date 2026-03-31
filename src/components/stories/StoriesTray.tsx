"use client";

import { useEffect, useState } from "react";

type TrayItem = {
  username: string;
  avatarDataUrl: string;
  latestStoryId: string;
  latestCreatedAt: string;
  hasUnseen: boolean;
};

export default function StoriesTray({
  currentUser,
  refreshKey,
  onOpenUser,
  onOpenUpload,
}: {
  currentUser: string;
  refreshKey: number;
  onOpenUser: (username: string) => void;
  onOpenUpload: () => void;
}) {
  const [items, setItems] = useState<TrayItem[]>([]);
  const [loading, setLoading] = useState(false);

  async function load() {
    setLoading(true);
    try {
      const res = await fetch(`/api/stories/tray?viewer=${encodeURIComponent(currentUser)}`, {
        cache: "no-store",
      });
      const data = await res.json().catch(() => ({}));
      if (res.ok) setItems((data.items || []) as TrayItem[]);
      else setItems([]);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (!currentUser) return;
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentUser, refreshKey]);

  // find if current user has story
  const me = items.find((x) => x.username.toLowerCase() === currentUser.toLowerCase());
  const others = items.filter((x) => x.username.toLowerCase() !== currentUser.toLowerCase());

  return (
    <div className="mt-3">
      <div className="flex items-center justify-between">
        <p className="text-sm font-semibold text-gray-900">Stories</p>
        {loading ? <p className="text-xs text-gray-500">Loading...</p> : null}
      </div>

      <div className="mt-3 flex gap-3 overflow-x-auto pb-2">
        {/* Your story */}
        <button
          onClick={() => (me ? onOpenUser(currentUser) : onOpenUpload())}
          className="flex flex-col items-center gap-1 shrink-0"
          aria-label="Your story"
        >
          <div
            className={`h-14 w-14 rounded-full p-[2px] ${
              me && me.hasUnseen ? "bg-brand-blue" : "bg-gray-300"
            }`}
          >
            <div className="h-full w-full rounded-full bg-white p-[2px]">
              <div className="h-full w-full rounded-full bg-neutral-100 flex items-center justify-center overflow-hidden">
                <span className="text-sm">🙂</span>
              </div>
            </div>
          </div>
          <p className="text-[11px] text-gray-700">Your story</p>
        </button>

        {/* Other users */}
        {others.map((u) => (
          <button
            key={u.latestStoryId}
            onClick={() => onOpenUser(u.username)}
            className="flex flex-col items-center gap-1 shrink-0"
            aria-label={`Story by ${u.username}`}
          >
            <div className={`h-14 w-14 rounded-full p-[2px] ${u.hasUnseen ? "bg-brand-blue" : "bg-gray-300"}`}>
              <div className="h-full w-full rounded-full bg-white p-[2px]">
                <div className="h-full w-full rounded-full bg-neutral-100 flex items-center justify-center overflow-hidden">
                  {u.avatarDataUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={u.avatarDataUrl} alt="avatar" className="h-full w-full object-cover" />
                  ) : (
                    <span className="text-sm">🙂</span>
                  )}
                </div>
              </div>
            </div>
            <p className="text-[11px] text-gray-700 max-w-[56px] truncate">{u.username}</p>
          </button>
        ))}

        {!loading && items.length === 0 ? (
          <p className="text-xs text-gray-500">No stories yet.</p>
        ) : null}
      </div>
    </div>
  );
}