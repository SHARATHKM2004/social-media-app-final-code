"use client";

import { useEffect, useState } from "react";
import { Post } from "@/types/post";

export default function EditProfileModal({
  open,
  username,
  pronoun,
  bio,
  userPosts,
  onChangePronoun,
  onChangeBio,
  onClose,
  onSave,
}: {
  open: boolean;
  username: string;
  pronoun: string;
  bio: string;
  userPosts: Post[];
  onChangePronoun: (v: string) => void;
  onChangeBio: (v: string) => void;
  onClose: () => void;
  onSave: () => void;
}) {
  // ✅ NEW
  const [successMsg, setSuccessMsg] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!open) return;
    setSuccessMsg("");
    setSaving(false);
  }, [open]);

  async function handleSave() {
    if (saving) return;

    setSaving(true);
    setSuccessMsg("");

    try {
      onSave();

      // ✅ NEW: show popup message then close quickly
      setSuccessMsg("Profile saved.");
      setTimeout(() => {
        onClose();
      }, 800);
    } finally {
      setSaving(false);
    }
  }

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="relative w-full max-w-md rounded-2xl bg-white p-5 shadow-soft">
        {/* ✅ Success popup */}
        {successMsg ? (
          <div className="absolute left-1/2 top-3 -translate-x-1/2 rounded-xl bg-green-600 px-4 py-2 text-sm font-semibold text-white shadow">
            {successMsg}
          </div>
        ) : null}

        <h2 className="text-lg font-semibold text-gray-900">Edit Profile</h2>

        <div className="mt-4 space-y-3">
          <div>
            <label className="mb-1 block text-xs font-semibold text-gray-600">Username</label>
            <input
              value={username}
              disabled
              className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm text-gray-600"
            />
          </div>

          <div>
            <label className="mb-1 block text-xs font-semibold text-gray-600">Pronoun</label>
            <select
              value={pronoun}
              onChange={(e) => onChangePronoun(e.target.value)}
              className="w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm outline-none focus:border-brand-blue focus:ring-2 focus:ring-brand-blue/20"
            >
              <option value="">Select pronoun</option>
              <option value="he/him">he/him</option>
              <option value="she/her">she/her</option>
            </select>
          </div>

          <div>
            <label className="mb-1 block text-xs font-semibold text-gray-600">Bio</label>
            <textarea
              value={bio}
              onChange={(e) => onChangeBio(e.target.value)}
              rows={3}
              className="w-full resize-none rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm outline-none focus:border-brand-blue focus:ring-2 focus:ring-brand-blue/20"
            />
          </div>

          {/* Keeping same behavior as your old file: posts grid shown inside edit modal */}
          {/* If you have the grid rendering below in your real file, keep it as-is */}

          <div className="mt-2 flex gap-3">
            <button
              onClick={onClose}
              disabled={saving}
              className="flex-1 rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm font-semibold text-gray-700 hover:bg-gray-50 disabled:opacity-60"
            >
              Cancel
            </button>

            <button
              onClick={handleSave}
              disabled={saving || !!successMsg}
              className="flex-1 rounded-xl bg-brand-blue px-4 py-3 text-sm font-semibold text-white hover:opacity-95 disabled:opacity-60"
            >
              {saving ? "Saving..." : successMsg ? "Done" : "Save"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
