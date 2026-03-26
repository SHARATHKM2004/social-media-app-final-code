"use client";

export default function AccountActionsModal({
  open,
  onClose,
  onChangePassword,
  onDeleteAccount,
}: {
  open: boolean;
  onClose: () => void;
  onChangePassword: () => void;
  onDeleteAccount: () => void;
}) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="w-full max-w-sm rounded-2xl bg-white p-5 shadow-soft">
        <h2 className="text-lg font-semibold text-gray-900">Account Actions</h2>

        <div className="mt-4 space-y-2">
          <button
            onClick={onChangePassword}
            className="w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-left text-sm font-semibold text-gray-700 hover:bg-gray-50"
          >
            Change Password
          </button>

          <button
            onClick={onDeleteAccount}
            className="w-full rounded-xl border border-red-200 bg-white px-4 py-3 text-left text-sm font-semibold text-red-600 hover:bg-red-50"
          >
            Delete Account
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