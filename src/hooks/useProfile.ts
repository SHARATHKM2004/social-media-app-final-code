"use client";

import { useEffect, useMemo, useState } from "react";
import { Post } from "@/types/post";

export function useProfileData() {
  const [username, setUsername] = useState("");
  const [pronoun, setPronoun] = useState("");
  const [bio, setBio] = useState("");
  const [avatarDataUrl, setAvatarDataUrl] = useState("");
  const [loading, setLoading] = useState(true);

  const [postsCount, setPostsCount] = useState(0);
  const [userPosts, setUserPosts] = useState<Post[]>([]);

  const profileLink = useMemo(() => {
    const base = typeof window !== "undefined" ? window.location.origin : "";
    return `${base}/profile?u=${encodeURIComponent(username || "")}`;
  }, [username]);

  async function refreshProfile(u: string) {
    // profile
    const res = await fetch("/api/profile", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username: u }),
    });
    const data = await res.json();

    if (res.ok) {
      setPronoun(data?.profile?.pronoun || "");
      setBio(data?.profile?.bio || "");
      setAvatarDataUrl(data?.profile?.avatarDataUrl || "");
    }

    // posts
    const postsRes = await fetch(`/api/posts?username=${encodeURIComponent(u)}`);
    const postsData = await postsRes.json();

    if (postsRes.ok) {
      const posts = postsData.posts || [];
      setUserPosts(posts);
      setPostsCount(posts.length);
    }
  }

  useEffect(() => {
    const u = localStorage.getItem("currentUser") || "";
    setUsername(u);

    async function load() {
      if (!u) {
        setLoading(false);
        return;
      }
      try {
        await refreshProfile(u);
      } finally {
        setLoading(false);
      }
    }

    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function uploadAvatar(file: File | null) {
    if (!file) return { ok: false, error: "" };

    const isJpg =
      file.type === "image/jpeg" ||
      file.name.toLowerCase().endsWith(".jpg") ||
      file.name.toLowerCase().endsWith(".jpeg");

    if (!isJpg) return { ok: false, error: "Please upload only JPG/JPEG image." };

    const dataUrl: string = await new Promise((resolve) => {
      const reader = new FileReader();
      reader.onload = () => resolve(String(reader.result || ""));
      reader.readAsDataURL(file);
    });

    setAvatarDataUrl(dataUrl);

    if (!username) return { ok: false, error: "No user." };

    await fetch("/api/profile", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, pronoun, bio, avatarDataUrl: dataUrl }),
    });

    return { ok: true, error: "" };
  }

  async function saveProfile() {
    if (!username) return { ok: false, error: "No user." };

    const res = await fetch("/api/profile", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, pronoun, bio, avatarDataUrl }),
    });

    const data = await res.json();

    if (!res.ok) return { ok: false, error: data?.error || "Failed to save." };
    return { ok: true, error: "" };
  }

async function shareProfile(): Promise<{ ok: boolean; copied?: boolean }> {
  const text = `My profile: ${profileLink}`;
  try {
    if (navigator.share) {
      await navigator.share({ title: "Profile", text, url: profileLink });
      return { ok: true };
    } else {
      await navigator.clipboard.writeText(profileLink);
      return { ok: true, copied: true };
    }
  } catch {
    return { ok: false };
  }
}

  async function changePassword(currentPassword: string, newPassword: string) {
    const res = await fetch("/api/change-password", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, currentPassword, newPassword }),
    });

    const data = await res.json();
    if (!res.ok) return { ok: false, error: data?.error || "Failed to change password." };
    return { ok: true, error: "" };
  }

  async function deleteAccount() {
    const res = await fetch("/api/delete-account", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username }),
    });

    if (!res.ok) return { ok: false };
    return { ok: true };
  }

  return {
    // data
    username,
    pronoun,
    bio,
    avatarDataUrl,
    loading,
    postsCount,
    userPosts,
    profileLink,

    // setters
    setPronoun,
    setBio,

    // actions
    refreshProfile,
    uploadAvatar,
    saveProfile,
    shareProfile,
    changePassword,
    deleteAccount,
  };
}