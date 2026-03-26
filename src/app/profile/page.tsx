"use client";

import { useState,lazy, Suspense } from "react";
import { useRouter } from "next/navigation";
import useBackToLanding from "@/components/useBackToLanding";
import BottomNav from "@/components/BottomNav";
import UserPostsGrid from "@/components/profile/UserPostsGrid";

import { useProfileData } from "@/hooks/useProfile";
const AccountActionsModal=lazy(() =>import("@/components/profile/AccountActionsModal"));
const PrivacyPolicyModal=lazy(() => import("@/components/profile/PrivacyPolicyModal"));
const FeedbackModal=lazy(() => import("@/components/profile/FeedbackModal"));


import ProfileHeader from "@/components/profile/ProfileHeader";
import ProfileInfo from "@/components/profile/ProfileInfo";
import ProfileBio from "@/components/profile/ProfileBio";
import ProfileActions from "@/components/profile/ProfileActions";

const EditProfileModal =lazy(()=>import("@/components/profile/EditProfileModal"));



const SettingsModal = lazy(() => import("@/components/profile/SettingsModal"));
const ChangePasswordModal= lazy(() => import ("@/components/profile/ChangePasswordModal"));
const LogoutConfirmModal=lazy(() => import("@/components/profile/LogoutConfirmModal"));
const AIAssistantModal=lazy(() => import("@/components/profile/AIAssistantModal"));

export default function ProfilePage() {
  const router = useRouter();
  useBackToLanding();

  const {
    username,
    pronoun,
    bio,
    avatarDataUrl,
    loading,
    postsCount,
    userPosts,
    profileLink,
    setPronoun,
    setBio,
    uploadAvatar,
    saveProfile,
    shareProfile,
    changePassword,
    deleteAccount,
  } = useProfileData();

  // local UI-only state
  const [showEdit, setShowEdit] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [showChangePassword, setShowChangePassword] = useState(false);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const [showAI, setShowAI] = useState(false);

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmNewPassword, setConfirmNewPassword] = useState("");

  const [actionError, setActionError] = useState("");
  const [actionOk, setActionOk] = useState("");


  const [showAccountActions, setShowAccountActions] = useState(false);
  const [showPrivacy, setShowPrivacy] = useState(false);
  const [showFeedback, setShowFeedback] = useState(false);


  function logoutNow() {
    localStorage.removeItem("currentUser");
    router.replace("/");
  }

  async function handleUploadAvatar(file: File | null) {
    setActionError("");
    setActionOk("");
    const r = await uploadAvatar(file);
    if (!r.ok && r.error) setActionError(r.error);
  }

async function handleDeletePost(postId: string) {
  if (!username) return;

  const ok = window.confirm("Are you sure you want to delete this post?");
  if (!ok) return;

  const res = await fetch(`/api/posts/${encodeURIComponent(postId)}/delete`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ username }),
  });

  const data = await res.json().catch(() => ({}));

  if (!res.ok) {
    setActionError(data?.error || "Failed to delete post.");
    return;
  }

  setActionOk("Post deleted ✅");
  setTimeout(() => setActionOk(""), 1000);

  // ✅ simplest refresh: reload page data
  window.location.reload();
}


  async function handleSaveProfile() {
    setActionError("");
    setActionOk("");
    const r = await saveProfile();
    if (!r.ok) {
      setActionError(r.error);
      return;
    }
    setActionOk("Saved ✅");
    setTimeout(() => {
      setShowEdit(false);
      setActionOk("");
    }, 800);
  }

  async function handleShareProfile() {
    setActionError("");
    setActionOk("");
    const r  = await shareProfile();
    if (r?.copied) {
      setActionOk("Profile link copied ✅");
      setTimeout(() => setActionOk(""), 1200);
    }
  }

  async function handleChangePassword() {
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

    const r = await changePassword(currentPassword, newPassword);
    if (!r.ok) {
      setActionError(r.error);
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

  async function handleDeleteAccount() {
    setActionError("");
    setActionOk("");

    const ok = window.confirm("Are you sure you want to delete your account?");
    if (!ok) return;

    const r = await deleteAccount();
    if (r.ok) {
      localStorage.removeItem("currentUser");
      router.replace("/");
    }
  }


  return (
       <Suspense fallback={<div>Loading...</div>}>
    <main className="min-h-screen bg-neutral-50 pb-16">
      <div className="mx-auto max-w-md p-5">
        <div className="rounded-3xl border-2 border-brand-blue bg-white p-5 shadow-soft">
          <ProfileHeader
            title={username || "Profile"}
            onOpenSettings={() => setShowSettings(true)}
            disabled={!username}
          />

          {loading ? (
            <p className="mt-6 text-sm text-gray-600">Loading...</p>
          ) : !username ? (
            <p className="mt-6 text-sm text-red-600">No user logged in. Please login again.</p>
          ) : (
            <>
              <ProfileInfo
                avatarDataUrl={avatarDataUrl}
                onUploadAvatar={handleUploadAvatar}
                postsCount={postsCount}
                pronoun={pronoun}
              />

              <ProfileBio bio={bio} />

              <ProfileActions
                onEdit={() => setShowEdit(true)}
                onShare={handleShareProfile}
              />

            <UserPostsGrid
  posts={userPosts}
  canDelete={true}
  onDelete={handleDeletePost}
/>
              {actionError ? <p className="mt-3 text-sm text-red-600">{actionError}</p> : null}
              {actionOk ? <p className="mt-3 text-sm text-green-600">{actionOk}</p> : null}
            </>
          )}
        </div>
      </div>

      <BottomNav />

      <EditProfileModal
        open={showEdit}
        username={username}
        pronoun={pronoun}
        bio={bio}
        userPosts={userPosts}
        onChangePronoun={setPronoun}
        onChangeBio={setBio}
        onClose={() => setShowEdit(false)}
        onSave={handleSaveProfile}
      />

    <SettingsModal
  open={showSettings}
  onClose={() => setShowSettings(false)}
  onAccountActions={() => {
    setShowSettings(false);
    setShowAccountActions(true);
  }}
  onAI={() => {
    setShowSettings(false);
    setShowAI(true);
  }}
  onPrivacy={() => {
    setShowSettings(false);
    setShowPrivacy(true);
  }}
  onFeedback={() => {
    setShowSettings(false);
    setShowFeedback(true);
  }}
  onLogout={() => {
    setShowSettings(false);
    setShowLogoutConfirm(true);
  }}
/>

      <ChangePasswordModal
        open={showChangePassword}
        currentPassword={currentPassword}
        newPassword={newPassword}
        confirmNewPassword={confirmNewPassword}
        setCurrentPassword={setCurrentPassword}
        setNewPassword={setNewPassword}
        setConfirmNewPassword={setConfirmNewPassword}
        actionError={actionError}
        actionOk={actionOk}
        onCancel={() => setShowChangePassword(false)}
        onUpdate={handleChangePassword}
      />

      <LogoutConfirmModal
        open={showLogoutConfirm}
        onCancel={() => setShowLogoutConfirm(false)}
        onLogout={() => {
          setShowLogoutConfirm(false);
          logoutNow();
        }}
      />

      <AIAssistantModal open={showAI} onClose={() => setShowAI(false)} />
      <AccountActionsModal
  open={showAccountActions}
  onClose={() => setShowAccountActions(false)}
  onChangePassword={() => {
    setShowAccountActions(false);
    setShowChangePassword(true);
  }}
  onDeleteAccount={handleDeleteAccount}
/>

<PrivacyPolicyModal open={showPrivacy} onClose={() => setShowPrivacy(false)} />

<FeedbackModal
  open={showFeedback}
  onClose={() => setShowFeedback(false)}
  username={username}
/>

    </main>
       </Suspense>
    
  );

}