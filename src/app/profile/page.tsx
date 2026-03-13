"use client";

import { useEffect, useMemo, useState } from "react";
import useBackToLanding from "@/components/useBackToLanding";
import BottomNav from "@/components/BottomNav";

import { useRouter } from "next/navigation";

export default function ProfilePage() {
  const router = useRouter();
  useBackToLanding();

  const [username, setUsername] = useState("");


  const [pronoun, setPronoun] = useState("");
  const [bio, setBio] = useState("");
  const [avatarDataUrl, setAvatarDataUrl] = useState("");

  const [loading, setLoading] = useState(true);

  // Modals
  const [showEdit, setShowEdit] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [showChangePassword, setShowChangePassword] = useState(false);

  // Change password fields
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmNewPassword, setConfirmNewPassword] = useState("");
  const [actionError, setActionError] = useState("");
  const [actionOk, setActionOk] = useState("");

  type Post = {
  id: string;
  author: string;
  mediaType: "image" | "video";
  mediaDataUrl: string;
  caption: string;
  createdAt: string;
  allowComments: boolean;
  allowRepost: boolean;
  likes: string[];
  reposts: string[];
  comments: { id: string; username: string; text: string; createdAt: string }[];
};

  const [qrDataUrl, setQrDataUrl] = useState("");
  const [postsCount, setPostsCount] = useState(0);
  const [userPosts, setUserPosts] = useState<Post[]>([]);


  const profileLink = useMemo(() => {
    const base = typeof window !== "undefined" ? window.location.origin : "";
    return `${base}/profile?u=${encodeURIComponent(username || "")}`;
  }, [username]);

  useEffect(() => {
    const u = localStorage.getItem("currentUser") || "";
    setUsername(u);

    async function loadProfile() {
      if (!u) {
        setLoading(false);
        return;
      }

      try {
        const res = await fetch("/api/profile", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ username: u }),
        });
        const data = await res.json();
        if (res.ok) {
          setPronoun(data.profile.pronoun || "");
          setBio(data.profile.bio || "");
          setAvatarDataUrl(data.profile.avatarDataUrl || "");
        
        }
const postsRes = await fetch(`/api/posts?username=${encodeURIComponent(u)}`);
const postsData = await postsRes.json();
if (postsRes.ok) {
  setUserPosts(postsData.posts || []);
  setPostsCount((postsData.posts || []).length);
}
      } 
      
      
      finally {
        setLoading(false);
      }
    }

    loadProfile();
  }, []);
  
  async function onUploadAvatar(file: File | null) {
    setActionError("");
    setActionOk("");

    if (!file) return;

    // Accept only jpg/jpeg
    const isJpg = file.type === "image/jpeg" || file.name.toLowerCase().endsWith(".jpg") || file.name.toLowerCase().endsWith(".jpeg");
    if (!isJpg) {
      setActionError("Please upload only JPG/JPEG image.");
      return;
    }

    const reader = new FileReader();
    reader.onload = async () => {
      const dataUrl = String(reader.result || "");
      setAvatarDataUrl(dataUrl);

      if (!username) return;

      await fetch("/api/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, pronoun, bio, avatarDataUrl: dataUrl }),
      });
    };
    reader.readAsDataURL(file);
  }

  async function openEdit() {
    setActionError("");
    setActionOk("");
    setShowEdit(true);

    // generate QR of profile link
   
  }

  async function saveProfile() {
    setActionError("");
    setActionOk("");

    if (!username) return;

    const res = await fetch("/api/profile", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, pronoun, bio, avatarDataUrl }),
    });

    const data = await res.json();

    if (!res.ok) {
      setActionError(data?.error || "Failed to save.");
      return;
    }

    setActionOk("Saved ✅");
    setTimeout(() => {
      setShowEdit(false);
      setActionOk("");
    }, 800);
  }

  async function shareProfile() {
    setActionError("");
    setActionOk("");

    const text = `My profile: ${profileLink}`;
    try {
      if (navigator.share) {
        await navigator.share({ title: "Profile", text, url: profileLink });
      } else {
        await navigator.clipboard.writeText(profileLink);
        setActionOk("Profile link copied ✅");
        setTimeout(() => setActionOk(""), 1200);
      }
    } catch {
      // ignore
    }
  }

  async function changePassword() {
    setActionError("");
    setActionOk("");

    if (!currentPassword || !newPassword || !confirmNewPassword) {
      setActionError("All fields are required.");
      return;
    }
    if (newPassword !== confirmNewPassword) {
      setActionError("New passwords do not match.");
      return;
    }

    const res = await fetch("/api/change-password", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, currentPassword, newPassword }),
    });
    const data = await res.json();

    if (!res.ok) {
      setActionError(data?.error || "Failed to change password.");
      return;
    }

    setActionOk("Password changed ✅");
    setCurrentPassword("");
    setNewPassword("");
    setConfirmNewPassword("");
    setTimeout(() => {
      setShowChangePassword(false);
      setActionOk("");
    }, 900);
  }

  function logout() {
    localStorage.removeItem("currentUser");
    router.replace("/");
  }

  async function deleteAccount() {
    setActionError("");
    setActionOk("");

    const ok = window.confirm("Are you sure you want to delete your account?");
    if (!ok) return;

    await fetch("/api/delete-account", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username }),
    });

    localStorage.removeItem("currentUser");
    router.replace("/");
  }

  return (
    <main className="min-h-screen bg-neutral-50 pb-16">
      <div className="mx-auto max-w-md p-5">
        <div className="rounded-3xl border-2 border-brand-blue bg-white p-5 shadow-soft">
          <div className="flex items-start justify-between">
            <div>
              <h1 className="text-xl font-bold text-gray-900">
                {username || "Profile"}
              </h1>
              <p className="text-xs text-brand-gray">Mini Social</p>
            </div>

            <button
  onClick={() => {
    if (!username) return;
    setShowSettings(true);
  }}
  disabled={!username}
  className={`rounded-xl p-2 ${
    username ? "text-gray-700 hover:bg-gray-100" : "text-gray-300 cursor-not-allowed"
  }`}
  title="Settings"
  aria-label="Settings"
>
  ⚙️
</button>
          </div>

          {loading ? (
            <p className="mt-6 text-sm text-gray-600">Loading...</p>
          ) : !username ? (
            <p className="mt-6 text-sm text-red-600">
              No user logged in. Please login again.
            </p>
          ) : (
            <>
              <div className="mt-6 flex items-center gap-4">
                <div className="relative">
                  <div className="h-20 w-20 overflow-hidden rounded-full border border-gray-200 bg-neutral-100">
                    {avatarDataUrl ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={avatarDataUrl} alt="avatar" className="h-full w-full object-cover" />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center text-2xl">
                        🙂
                      </div>
                    )}
                  </div>

                  <label
                    className="absolute bottom-0 right-0 cursor-pointer rounded-full bg-brand-blue px-2 py-1 text-xs text-white shadow"
                    title="Upload JPG"
                  >
                    📷
                    <input
                      type="file"
                      accept="image/jpeg,.jpg,.jpeg"
                      className="hidden"
                      onChange={(e) => onUploadAvatar(e.target.files?.[0] || null)}
                    />
                  </label>
                </div>

                <div className="flex-1">
                  <p className="text-sm text-gray-700">
                    <span className="font-semibold">{postsCount}</span> posts
                  </p>
                  <p className="mt-1 text-sm text-gray-700">
                    <span className="text-gray-500">Pronoun:</span>{" "}
                    {pronoun || <span className="text-gray-400">empty</span>}
                  </p>
                </div>
              </div>

              <div className="mt-4 rounded-2xl bg-neutral-50 p-4">
                <p className="text-sm text-gray-700">
                  <span className="font-semibold">Bio:</span>{" "}
                  {bio || <span className="text-gray-400">empty</span>}
                </p>
              </div>

              <div className="mt-5 grid grid-cols-2 gap-3">
                <button
                  onClick={openEdit}
                  className="rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm font-semibold text-gray-700 hover:bg-gray-50"
                >
                  Edit Profile
                </button>

                <button
                  onClick={shareProfile}
                  className="rounded-xl bg-brand-blue px-4 py-3 text-sm font-semibold text-white hover:opacity-95"
                >
                  Share Profile
                </button>
              </div>

              {actionError ? <p className="mt-3 text-sm text-red-600">{actionError}</p> : null}
              {actionOk ? <p className="mt-3 text-sm text-green-600">{actionOk}</p> : null}
            </>
          )}
        </div>
      </div>

      <BottomNav />

      {/* Edit Modal */}
      {showEdit && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-md rounded-2xl bg-white p-5 shadow-soft">
            <h2 className="text-lg font-semibold text-gray-900">Edit Profile</h2>

            <div className="mt-4 space-y-3">
              
<label className="mb-1 block text-xs font-semibold text-gray-600">
      Username
    </label>

              <input
                value={username}
                disabled
                className="w-full cursor-not-allowed rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm text-gray-600"
              />
              <div>
                
<label className="mb-1 block text-xs font-semibold text-gray-600">
      Pronoun
    </label>

              <input
                placeholder="Pronoun (e.g. he/him, she/her, they/them)"
                value={pronoun}
                onChange={(e) => setPronoun(e.target.value)}
                className="w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm outline-none focus:border-brand-blue focus:ring-2 focus:ring-brand-blue/20"
              />
              </div>
<div>
  
 <label className="mb-1 block text-xs font-semibold text-gray-600">
      Bio
    </label>
    

              <textarea
                placeholder="Write something about yourself."
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                rows={3}
                className="w-full resize-none rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm outline-none focus:border-brand-blue focus:ring-2 focus:ring-brand-blue/20"
              />
</div>


<div className="mt-5">
  <h3 className="text-sm font-semibold text-gray-900">Posts</h3>

  {userPosts.length === 0 ? (
    <p className="mt-2 text-sm text-gray-600">No posts yet.</p>
  ) : (
    <div className="mt-3 grid grid-cols-3 gap-2">
      {userPosts.map((p) => (
        <div key={p.id} className="aspect-square overflow-hidden rounded-xl border border-gray-200 bg-neutral-100">
          {p.mediaType === "image" ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={p.mediaDataUrl} alt="post" className="h-full w-full object-cover" />
          ) : (
            <video className="h-full w-full object-cover">
              <source src={p.mediaDataUrl} />
            </video>
          )}
        </div>
      ))}
    </div>
  )}
</div>
              <div className="mt-2 flex gap-3">
                <button
                  onClick={() => setShowEdit(false)}
                  className="flex-1 rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm font-semibold text-gray-700 hover:bg-gray-50"
                >
                  Cancel
                </button>

                <button
                  onClick={saveProfile}
                  className="flex-1 rounded-xl bg-brand-blue px-4 py-3 text-sm font-semibold text-white hover:opacity-95"
                >
                  Save
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Settings Modal */}
      {showSettings && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-sm rounded-2xl bg-white p-5 shadow-soft">
            <h2 className="text-lg font-semibold text-gray-900">Settings</h2>

            <div className="mt-4 space-y-2">
              <button
                onClick={() => {
                  setShowSettings(false);
                  setShowChangePassword(true);
                }}
                className="w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-left text-sm font-semibold text-gray-700 hover:bg-gray-50"
              >
                Change Password
              </button>

              <button
                onClick={logout}
                className="w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-left text-sm font-semibold text-gray-700 hover:bg-gray-50"
              >
                Logout
              </button>

              <button
                onClick={deleteAccount}
                className="w-full rounded-xl border border-red-200 bg-white px-4 py-3 text-left text-sm font-semibold text-red-600 hover:bg-red-50"
              >
                Delete Account
              </button>
            </div>

            <button
              onClick={() => setShowSettings(false)}
              className="mt-4 w-full rounded-xl bg-brand-blue px-4 py-3 text-sm font-semibold text-white hover:opacity-95"
            >
              Close
            </button>
          </div>
        </div>
      )}

      {/* Change Password Modal */}
      {showChangePassword && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-md rounded-2xl bg-white p-5 shadow-soft">
            <h2 className="text-lg font-semibold text-gray-900">Change Password</h2>
            <p className="mt-1 text-xs text-gray-600">
              New password must be 8+ chars with uppercase, lowercase, number & symbol.
            </p>

            <div className="mt-4 space-y-3">
              <input
                type="password"
                placeholder="Current password"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                className="w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm outline-none focus:border-brand-blue focus:ring-2 focus:ring-brand-blue/20"
              />
              <input
                type="password"
                placeholder="New password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm outline-none focus:border-brand-blue focus:ring-2 focus:ring-brand-blue/20"
              />
              <input
                type="password"
                placeholder="Confirm new password"
                value={confirmNewPassword}
                onChange={(e) => setConfirmNewPassword(e.target.value)}
                className="w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm outline-none focus:border-brand-blue focus:ring-2 focus:ring-brand-blue/20"
              />

              {actionError ? <p className="text-sm text-red-600">{actionError}</p> : null}
              {actionOk ? <p className="text-sm text-green-600">{actionOk}</p> : null}

              <div className="flex gap-3 pt-1">
                <button
                  onClick={() => setShowChangePassword(false)}
                  className="flex-1 rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm font-semibold text-gray-700 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  onClick={changePassword}
                  className="flex-1 rounded-xl bg-brand-blue px-4 py-3 text-sm font-semibold text-white hover:opacity-95"
                >
                  Update
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}