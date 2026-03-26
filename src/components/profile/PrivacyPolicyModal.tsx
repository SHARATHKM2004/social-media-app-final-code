"use client";

export default function PrivacyPolicyModal({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="w-full max-w-md rounded-2xl bg-white p-5 shadow-soft">
        <h2 className="text-lg font-semibold text-gray-900">Privacy Policy</h2>

        <div className="mt-3 space-y-2 text-sm text-gray-700">
          <p>
            This is a demo social-media app created for learning. User data is stored locally in JSON files.
          </p>
          <p>
            Uploaded images/videos and profile photos are stored for demo purposes only.
          </p>
          <p>
            Do not upload real sensitive data. This app is not meant for production use.
          </p>
        </div>

        <button
          onClick={onClose}
          className="mt-4 w-full rounded-xl bg-brand-blue px-4 py-3 text-sm font-semibold text-white hover:opacity-95"
        >
          Close
        </button>
      </div>
    </div>
  );
}