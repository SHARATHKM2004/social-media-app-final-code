"use client";

import { useEffect, useState } from "react";

export default function StoryUploadModal({
  open,
  currentUser,
  onClose,
  onUploaded,
}: {
  open: boolean;
  currentUser: string;
  onClose: () => void;
  onUploaded: () => void;
}) {
  const [mediaDataUrl, setMediaDataUrl] = useState("");
  const [err, setErr] = useState("");
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    if (!open) return;
    setMediaDataUrl("");
    setErr("");
    setUploading(false);
  }, [open]);

  async function pick(file: File | null) {
    setErr("");
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      setErr("Only image stories are allowed.");
      return;
    }

    if (file.size > 1 * 1024 * 1024) {
      setErr("Image too large. Please upload <= 1MB.");
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      setMediaDataUrl(String(reader.result || ""));
    };
    reader.readAsDataURL(file);
  }

  async function upload() {
    if (!currentUser) {
      setErr("Please login again.");
      return;
    }
    if (!mediaDataUrl) {
      setErr("Please select an image.");
      return;
    }

    setUploading(true);
    try {
      const res = await fetch("/api/stories", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username: currentUser, mediaDataUrl }),
      });

      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setErr(data?.error || "Failed to upload story.");
        return;
      }

      onUploaded();
      onClose();
    } finally {
      setUploading(false);
    }
  }

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="w-full max-w-md rounded-2xl bg-white p-5 shadow-soft">
        <h2 className="text-lg font-semibold text-gray-900">Add Story</h2>
        <p className="mt-1 text-xs text-gray-600">Image only • expires in 24 hours</p>

        <div className="mt-4 space-y-3">
          <input
            type="file"
            accept="image/*"
            onChange={(e) => pick(e.target.files?.[0] || null)}
            className="w-full rounded-xl border border-gray-200 bg-white px-3 py-2 text-sm"
          />

          {mediaDataUrl ? (
            <div className="overflow-hidden rounded-2xl border border-gray-200">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={mediaDataUrl} alt="preview" className="w-full max-h-[260px] object-contain bg-white" />
            </div>
          ) : null}

          {err ? <p className="text-sm text-red-600">{err}</p> : null}

          <div className="mt-2 flex gap-3">
            <button
              onClick={onClose}
              className="flex-1 rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm font-semibold text-gray-700 hover:bg-gray-50"
            >
              Cancel
            </button>

            <button
              onClick={upload}
              disabled={uploading}
              className="flex-1 rounded-xl bg-brand-blue px-4 py-3 text-sm font-semibold text-white hover:opacity-95 disabled:opacity-60"
            >
              {uploading ? "Uploading..." : "Upload"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
