"use client";

export default function UserListModal({
  title,
  users,
  onClose,
}: {
  title: string;
  users: string[];
  onClose: () => void;
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="w-full max-w-sm rounded-2xl bg-white p-5 shadow-soft">
        <h2 className="text-lg font-semibold text-gray-900">{title}</h2>

        <div className="mt-4 max-h-72 overflow-auto space-y-2">
          {users.length === 0 ? (
            <p className="text-sm text-gray-600">No users yet.</p>
          ) : (
            users.map((u) => (
              <div
                key={u}
                className="rounded-xl border border-gray-200 px-3 py-2 text-sm text-gray-800"
              >
                {u}
              </div>
            ))
          )}
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
