"use client";

export default function LogoutConfirmModal({
  open,
  onCancel,
  onLogout,
}: {
  open: boolean;
  onCancel: () => void;
  onLogout: () => void;
}) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="w-full max-w-sm rounded-2xl bg-white p-5 shadow-soft">
        <h2 className="text-lg font-semibold text-gray-900">Logout?</h2>
        <p className="mt-2 text-sm text-gray-600">Are you sure you want to logout?</p>

        <div className="mt-5 flex gap-3">
          <button
            onClick={onCancel}
            className="flex-1 rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm font-semibold text-gray-700 hover:bg-gray-50"
          >
            Cancel
          </button>

          <button
            onClick={onLogout}
            className="flex-1 rounded-xl bg-brand-blue px-4 py-3 text-sm font-semibold text-white hover:opacity-95"
          >
            Logout
          </button>
        </div>
      </div>
    </div>
  );
}