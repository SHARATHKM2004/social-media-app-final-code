"use client";

import { useCallback, useEffect, useState } from "react";
import { Post } from "@/types/post";

export function useFeed(currentUser: string) {
  const [posts, setPosts] = useState<Post[]>([]);
  const [feedLoading, setFeedLoading] = useState(false);

  const loadFeed = useCallback(async () => {
    setFeedLoading(true);
    try {
      const res = await fetch("/api/posts");
      const data = await res.json();
      if (res.ok) setPosts(data.posts || []);
    } finally {
      setFeedLoading(false);
    }
  }, []);

  useEffect(() => {
    loadFeed();
  }, [loadFeed]);

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

  return { posts, feedLoading, loadFeed, toggleLike, toggleRepost, addComment };
}