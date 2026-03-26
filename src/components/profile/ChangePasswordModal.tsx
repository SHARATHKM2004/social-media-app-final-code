"use client";

export default function ChangePasswordModal({
  open,
  currentPassword,
  newPassword,
  confirmNewPassword,
  setCurrentPassword,
  setNewPassword,
  setConfirmNewPassword,
  actionError,
  actionOk,
  onCancel,
  onUpdate,
}: {
  open: boolean;
  currentPassword: string;
  newPassword: string;
  confirmNewPassword: string;
  setCurrentPassword: (v: string) => void;
  setNewPassword: (v: string) => void;
  setConfirmNewPassword: (v: string) => void;
  actionError: string;
  actionOk: string;
  onCancel: () => void;
  onUpdate: () => void;
}) {
  if (!open) return null;

  return (
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
              onClick={onCancel}
              className="flex-1 rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm font-semibold text-gray-700 hover:bg-gray-50"
            >
              Cancel
            </button>

            <button
              onClick={onUpdate}
              className="flex-1 rounded-xl bg-brand-blue px-4 py-3 text-sm font-semibold text-white hover:opacity-95"
            >
              Update
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}