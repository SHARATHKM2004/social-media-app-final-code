"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { Post } from "@/types/post";

const PAGE_SIZE = 5;

export function useFeed(currentUser: string) {
  const [posts, setPosts] = useState<Post[]>([]);
  const [feedLoading, setFeedLoading] = useState(false);

  // pagination state
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);

  const buildUrl = useCallback((p: number) => {
    return `/api/posts?page=${p}&limit=${PAGE_SIZE}`;
  }, []);

  // ✅ Load page 1 limit 5
  const loadFeed = useCallback(async () => {
    setFeedLoading(true);
    try {
      const res = await fetch(buildUrl(1), { cache: "no-store" });
      const data = await res.json();

      if (res.ok) {
        setPosts(data.posts || []);
        setPage(data.page || 1);
        setHasMore(Boolean(data.hasMore));
      } else {
        setPosts([]);
        setPage(1);
        setHasMore(false);
      }
    } finally {
      setFeedLoading(false);
    }
  }, [buildUrl]);

  // ✅ Load next page limit 5 and APPEND
  const loadMore = useCallback(async () => {
    if (loadingMore) return;
    if (!hasMore) return;

    const nextPage = page + 1;
    setLoadingMore(true);

    try {
      const res = await fetch(buildUrl(nextPage), { cache: "no-store" });
      const data = await res.json();

      if (res.ok) {
        const newPosts: Post[] = data.posts || [];

        // Append and avoid duplicates by id
        setPosts((prev) => {
          const seen = new Set(prev.map((p) => p.id));
          const merged = [...prev];
          for (const np of newPosts) {
            if (!seen.has(np.id)) merged.push(np);
          }
          return merged;
        });

        setPage(data.page || nextPage);
        setHasMore(Boolean(data.hasMore));
      }
    } finally {
      setLoadingMore(false);
    }
  }, [buildUrl, hasMore, loadingMore, page]);

  // initial load
  useEffect(() => {
    loadFeed();
  }, [loadFeed]);

  // existing actions (same as your current file)
  const toggleLike = useCallback(
    async (postId: string) => {
      if (!currentUser) return;

      const res = await fetch(`/api/posts/${postId}/like`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username: currentUser }),
      });

      const data = await res.json();
      if (res.ok) {
        setPosts((prev) =>
          prev.map((p) => (p.id === postId ? { ...p, likes: data.likes } : p))
        );
      }
    },
    [currentUser]
  );

  const toggleRepost = useCallback(
    async (post: Post) => {
      if (!currentUser) return;
      if (!post.allowRepost) return;

      const res = await fetch(`/api/posts/${post.id}/repost`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username: currentUser }),
      });

      const data = await res.json();
      if (res.ok) {
        setPosts((prev) =>
          prev.map((p) => (p.id === post.id ? { ...p, reposts: data.reposts } : p))
        );
      }
    },
    [currentUser]
  );

  const addComment = useCallback(
    async (post: Post, text: string) => {
      if (!currentUser) return null;
      if (!post.allowComments) return null;

      const trimmed = text.trim();
      if (!trimmed) return null;

      const res = await fetch(`/api/posts/${post.id}/comment`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username: currentUser, text: trimmed }),
      });

      const data = await res.json();
      if (res.ok) {
        setPosts((prev) =>
          prev.map((p) => (p.id === post.id ? { ...p, comments: data.comments } : p))
        );
        return data.comments as Post["comments"];
      }
      return null;
    },
    [currentUser]
  );

  const showLoadMore = useMemo(() => {
    return !feedLoading && posts.length > 0 && hasMore;
  }, [feedLoading, posts.length, hasMore]);

  return {
    posts,
    feedLoading,
    loadFeed,

    // pagination
    page,
    hasMore,
    loadingMore,
    loadMore,
    showLoadMore,

    // actions
    toggleLike,
    toggleRepost,
    addComment,
  };
}