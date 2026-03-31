"use client";

import { useEffect, useMemo, useRef, useState } from "react";

type TrayItem = {
  username: string;
  avatarDataUrl: string;
  latestStoryId: string;
  latestCreatedAt: string;
  hasUnseen: boolean;
};

type Story = {
  id: string;
  username: string;
  mediaDataUrl: string; // image only
  createdAt: string;
  expiresAt: string;
};

function safeLower(s: string) {
  return (s || "").toLowerCase();
}

export default function StoryViewerModal({
  open,
  viewer,
  username, // start username
  onClose,
  onSeen,
}: {
  open: boolean;
  viewer: string;
  username: string;
  onClose: () => void;
  onSeen: () => void;
}) {
  // ---------- popup sizing ----------
  const frameW = 360;
  const frameH = 640;

  // ✅ Step 3: like state
  const [likesCount, setLikesCount] = useState(0);
  const [likedByMe, setLikedByMe] = useState(false);
  const [liking, setLiking] = useState(false);

  // ---------- tray order + per-user story cache ----------
  const [trayUsers, setTrayUsers] = useState<string[]>([]);
  const [storiesByUser, setStoriesByUser] = useState<Record<string, Story[]>>({});
  const [loadingTray, setLoadingTray] = useState(false);
  const [loadingUserStories, setLoadingUserStories] = useState(false);

  // current pointers
  const [userIndex, setUserIndex] = useState(0);
  const [storyIndex, setStoryIndex] = useState(0);

  // for auto-advance timer
  const timerRef = useRef<number | null>(null);

  // derive current user + stories
  const currentUsername = trayUsers[userIndex] || "";
  const currentStories = storiesByUser[currentUsername] || [];
  const currentStory = currentStories[storyIndex];

  // ---------- helpers ----------
  function clearTimer() {
    if (timerRef.current != null) {
      window.clearTimeout(timerRef.current);
      timerRef.current = null;
    }
  }

  async function fetchTray() {
    if (!viewer) return [];
    const res = await fetch(`/api/stories/tray?viewer=${encodeURIComponent(viewer)}`, {
      cache: "no-store",
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) return [];
    return (data.items || []) as TrayItem[];
  }

  async function fetchUserStories(u: string) {
    const res = await fetch(
      `/api/stories/user?username=${encodeURIComponent(u)}&viewer=${encodeURIComponent(viewer)}`,
      { cache: "no-store" }
    );
    const data = await res.json().catch(() => ({}));
    if (!res.ok) return [];
    return (data.stories || []) as Story[];
  }

  async function ensureStoriesLoaded(u: string) {
    if (!u) return;
    if (storiesByUser[u] && storiesByUser[u].length > 0) return;

    setLoadingUserStories(true);
    try {
      const list = await fetchUserStories(u);
      setStoriesByUser((prev) => ({ ...prev, [u]: list }));
    } finally {
      setLoadingUserStories(false);
    }
  }

  function moveTo(userIdx: number, sIdx: number) {
    setUserIndex(userIdx);
    setStoryIndex(sIdx);
  }

  function goNext() {
    // next story in same user
    if (storyIndex < currentStories.length - 1) {
      moveTo(userIndex, storyIndex + 1);
      return;
    }

    // next user
    if (userIndex < trayUsers.length - 1) {
      moveTo(userIndex + 1, 0);
      return;
    }

    // end
    onClose();
  }

  function goPrev() {
    // prev story in same user
    if (storyIndex > 0) {
      moveTo(userIndex, storyIndex - 1);
      return;
    }

    // prev user (last story)
    if (userIndex > 0) {
      const prevUser = trayUsers[userIndex - 1];
      const prevStories = storiesByUser[prevUser] || [];
      const lastIdx = Math.max(0, prevStories.length - 1);
      moveTo(userIndex - 1, lastIdx);
      return;
    }
  }

  // ---------- on open: load tray and set start user ----------
  useEffect(() => {
    if (!open) return;

    // reset all state each open (safe)
    setTrayUsers([]);
    setStoriesByUser({});
    setUserIndex(0);
    setStoryIndex(0);
    setLoadingTray(true);

    // reset like UI
    setLikesCount(0);
    setLikedByMe(false);
    setLiking(false);

    (async () => {
      try {
        const tray = await fetchTray();

        const rawUsers = tray.map((t) => t.username).filter(Boolean);

        const start = (username || "").trim();
        let ordered: string[] = [];

        if (start) ordered.push(start);

        for (const u of rawUsers) {
          if (safeLower(u) === safeLower(start)) continue;
          ordered.push(u);
        }

        ordered = ordered.filter(Boolean);
        setTrayUsers(ordered);

        // preload only the first user's stories
        if (ordered.length > 0) {
          const firstUser = ordered[0];
          const list = await fetchUserStories(firstUser);
          setStoriesByUser({ [firstUser]: list });
          setUserIndex(0);
          setStoryIndex(0);
        }
      } finally {
        setLoadingTray(false);
      }
    })();

    return () => {
      clearTimer();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, username, viewer]);

  // ---------- when userIndex changes: ensure that user's stories are loaded ----------
  useEffect(() => {
    if (!open) return;
    if (!currentUsername) return;
    ensureStoriesLoaded(currentUsername);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, currentUsername]);

  // ---------- when current story changes: mark seen + refresh rings ----------
  useEffect(() => {
    if (!open) return;
    if (!currentStory) return;
    if (!viewer) return;

    fetch("/api/stories/view", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ storyId: currentStory.id, viewer }),
    }).catch(() => null);

    onSeen();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, currentStory?.id]);

  // ✅ Step 3: load like state when story changes
  useEffect(() => {
    if (!open) return;
    if (!currentStory?.id) return;
    if (!viewer) return;

    (async () => {
      const res = await fetch(
        `/api/stories/like?storyId=${encodeURIComponent(currentStory.id)}&user=${encodeURIComponent(viewer)}`,
        { cache: "no-store" }
      );
      const data = await res.json().catch(() => ({}));
      if (res.ok) {
        setLikesCount(Number(data.likesCount || 0));
        setLikedByMe(!!data.liked);
      } else {
        setLikesCount(0);
        setLikedByMe(false);
      }
    })();
  }, [open, currentStory?.id, viewer]);

  // ✅ Step 3: toggle like
  async function toggleLike() {
    if (!currentStory?.id) return;
    if (!viewer) return;
    if (liking) return;

    setLiking(true);
    try {
      const res = await fetch("/api/stories/like", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ storyId: currentStory.id, username: viewer }),
      });

      const data = await res.json().catch(() => ({}));
      if (res.ok) {
        setLikedByMe(!!data.liked);
        setLikesCount(Number(data.likesCount || 0));
      }
    } finally {
      setLiking(false);
    }
  }

  // ---------- auto-advance (image only) ----------
  useEffect(() => {
    if (!open) return;
    clearTimer();
    if (!currentStory) return;

    timerRef.current = window.setTimeout(() => {
      goNext();
    }, 5000);

    return () => clearTimer();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, userIndex, storyIndex, currentStory?.id]);

  // ---------- click zones (left/right) ----------
  function onClickFrame(e: React.MouseEvent<HTMLDivElement>) {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const half = rect.width / 2;

    if (x < half) goPrev();
    else goNext();
  }

  if (!open) return null;

  const isEmpty = !loadingTray && trayUsers.length === 0;

  return (
    <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4">
      {/* Popup frame */}
      <div
        className="relative rounded-2xl bg-black overflow-hidden shadow-2xl"
        style={{ width: frameW, height: frameH }}
      >
        {/* Top bar */}
        <div className="absolute left-0 right-0 top-0 z-10 px-4 py-3 text-white flex items-center justify-between">
          <div className="min-w-0">
            <p className="text-sm font-semibold truncate">
              {loadingTray ? "Loading..." : currentUsername || username || "Story"}
            </p>
          </div>

          <button
            onClick={onClose}
            className="rounded-xl bg-white/15 px-3 py-2 text-xs font-semibold hover:bg-white/25"
          >
            Close
          </button>
        </div>

        {/* Progress bar */}
        <div className="absolute left-0 right-0 top-12 z-10 px-3">
          <div className="flex gap-1">
            {(currentStories.length ? currentStories : new Array(1).fill(null)).map((_, i) => {
              const done = i < storyIndex;
              const active = i === storyIndex;
              return (
                <div key={i} className="h-1 flex-1 rounded bg-white/20 overflow-hidden">
                  <div className={`h-full bg-white ${done ? "w-full" : active ? "w-1/2" : "w-0"}`} />
                </div>
              );
            })}
          </div>
        </div>

        {/* Story body */}
        <div
          className="absolute inset-0 pt-16 pb-14 px-3 flex items-center justify-center"
          onClick={onClickFrame}
        >
          {isEmpty ? (
            <p className="text-sm text-white/80">No active stories.</p>
          ) : loadingTray || loadingUserStories ? (
            <p className="text-sm text-white/80">Loading...</p>
          ) : !currentStory ? (
            <p className="text-sm text-white/80">No active stories.</p>
          ) : (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={currentStory.mediaDataUrl}
              alt="story"
              className="max-h-full max-w-full object-contain rounded-xl"
              draggable={false}
            />
          )}
        </div>

        {/* Bottom controls */}
        <div className="absolute left-0 right-0 bottom-0 z-10 px-4 py-3 flex items-center justify-between">
          <button
            onClick={goPrev}
            className="rounded-xl bg-white/15 px-4 py-2 text-xs font-semibold text-white hover:bg-white/25"
          >
            Prev
          </button>

          {/* ✅ Like button + count */}
          <button
            onClick={toggleLike}
            disabled={liking || !currentStory}
            className="rounded-xl bg-white/15 px-4 py-2 text-xs font-semibold text-white hover:bg-white/25 disabled:opacity-60"
            aria-label="Like story"
            title="Like story"
          >
            {likedByMe ? "❤️" : "🤍"} {likesCount}
          </button>

          <button
            onClick={goNext}
            className="rounded-xl bg-white/15 px-4 py-2 text-xs font-semibold text-white hover:bg-white/25"
          >
            Next
          </button>
        </div>
      </div>
    </div>
  );
}
