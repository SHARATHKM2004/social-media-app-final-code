"use client";

export default function SettingsModal({
  open,
  onClose,
  onAccountActions,
  onAI,
  onPrivacy,
  onFeedback,
  onLogout,
}: {
  open: boolean;
  onClose: () => void;
  onAccountActions: () => void;
  onAI: () => void;
  onPrivacy: () => void;
  onFeedback: () => void;
  onLogout: () => void;
}) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="w-full max-w-sm rounded-2xl bg-white p-5 shadow-soft">
        <h2 className="text-lg font-semibold text-gray-900">Settings</h2>

        <div className="mt-4 space-y-2">
          <button
            onClick={onAccountActions}
            className="w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-left text-sm font-semibold text-gray-700 hover:bg-gray-50"
          >
            Account Actions
          </button>

          <button
            onClick={onAI}
            className="w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-left text-sm font-semibold text-gray-700 hover:bg-gray-50"
          >
            AI Assistant
          </button>

          <button
            onClick={onPrivacy}
            className="w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-left text-sm font-semibold text-gray-700 hover:bg-gray-50"
          >
            Privacy Policy
          </button>

          <button
            onClick={onFeedback}
            className="w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-left text-sm font-semibold text-gray-700 hover:bg-gray-50"
          >
            Submit Feedback
          </button>

          <button
            onClick={onLogout}
            className="w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-left text-sm font-semibold text-gray-700 hover:bg-gray-50"
          >
            Logout
          </button>
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