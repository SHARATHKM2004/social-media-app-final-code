"use client";

import { useState } from "react";

export default function FeedbackModal({
  open,
  onClose,
  username,
}: {
  open: boolean;
  onClose: () => void;
  username: string;
}) {
  const [message, setMessage] = useState("");
  const [files, setFiles] = useState<File[]>([]);
  const [status, setStatus] = useState<"" | "ok" | "err">("");
  const [err, setErr] = useState("");

  if (!open) return null;

  async function fileToDataUrl(file: File) {
    return new Promise<string>((resolve) => {
      const reader = new FileReader();
      reader.onload = () => resolve(String(reader.result || ""));
      reader.readAsDataURL(file);
    });
  }

  async function submit() {
    setErr("");
    setStatus("");

    if (!username) {
      setErr("Please login again.");
      return;
    }
    if (!message.trim()) {
      setErr("Please enter feedback message.");
      return;
    }

    // allow only images + pdf
    const allowed = files.filter(
      (f) => f.type.startsWith("image/") || f.type === "application/pdf"
    );

    // limit files (avoid huge JSON)
    if (allowed.some((f) => f.size > 5 * 1024 * 1024)) {
      setErr("Each file must be under 5MB.");
      return;
    }

    const payloadFiles = await Promise.all(
      allowed.map(async (f) => ({
        name: f.name,
        type: f.type,
        dataUrl: await fileToDataUrl(f),
      }))
    );

    const res = await fetch("/api/feedback", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, message, files: payloadFiles }),
    });

    const data = await res.json().catch(() => ({}));

    if (!res.ok) {
      setErr(data?.error || "Failed to submit feedback.");
      setStatus("err");
      return;
    }

    setStatus("ok");

    setTimeout(() => {
      // reload page (as you requested)
      window.location.reload();
    }, 800);
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="w-full max-w-md rounded-2xl bg-white p-5 shadow-soft">
        <h2 className="text-lg font-semibold text-gray-900">Submit Feedback</h2>

        <div className="mt-4 space-y-3">
          <textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            rows={4}
            placeholder="Write your feedback..."
            className="w-full resize-none rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm outline-none focus:border-brand-blue focus:ring-2 focus:ring-brand-blue/20"
          />

          <div>
            <label className="mb-1 block text-xs font-semibold text-gray-600">
              Upload files (Image/PDF)
            </label>
            <input
              type="file"
              accept="image/*,application/pdf"
              multiple
              onChange={(e) => setFiles(Array.from(e.target.files || []))}
              className="w-full rounded-xl border border-gray-200 bg-white px-3 py-2 text-sm"
            />
          </div>

          {err ? <p className="text-sm text-red-600">{err}</p> : null}
          {status === "ok" ? (
            <p className="text-sm text-green-600">Feedback submitted successfully ✅</p>
          ) : null}

          <div className="flex gap-3">
            <button
              onClick={onClose}
              className="flex-1 rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm font-semibold text-gray-700 hover:bg-gray-50"
            >
              Cancel
            </button>

            <button
              onClick={submit}
              className="flex-1 rounded-xl bg-brand-blue px-4 py-3 text-sm font-semibold text-white hover:opacity-95"
            >
              Submit
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}