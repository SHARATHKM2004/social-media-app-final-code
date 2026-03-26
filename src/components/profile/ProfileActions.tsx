"use client";

export default function ProfileActions({
  onEdit,
  onShare,
}: {
  onEdit: () => void;
  onShare: () => void;
}) {
  return (
    <div className="mt-5 grid grid-cols-2 gap-3">
      <button
        onClick={onEdit}
        className="rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm font-semibold text-gray-700 hover:bg-gray-50"
      >
        Edit Profile
      </button>

      <button
        onClick={onShare}
        className="rounded-xl bg-brand-blue px-4 py-3 text-sm font-semibold text-white hover:opacity-95"
      >
        Share Profile
      </button>
    </div>
  );
}