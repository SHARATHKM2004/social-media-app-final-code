"use client";

export default function ProfileInfo({
  avatarDataUrl,
  onUploadAvatar,
  postsCount,
  pronoun,
}: {
  avatarDataUrl: string;
  onUploadAvatar: (file: File | null) => void;
  postsCount: number;
  pronoun: string;
}) {
  return (
    <div className="mt-6 flex items-center gap-4">
      <div className="relative">
        <div className="h-20 w-20 overflow-hidden rounded-full border border-gray-200 bg-neutral-100">
          {avatarDataUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={avatarDataUrl} alt="avatar" className="h-full w-full object-cover" />
          ) : (
            <div className="flex h-full w-full items-center justify-center text-2xl">🙂</div>
          )}
        </div>

        <label
          className="absolute bottom-0 right-0 cursor-pointer rounded-full bg-brand-blue px-2 py-1 text-xs text-white shadow"
          title="Upload JPG"
        >
          📷
          <input
            type="file"
            accept="image/jpeg,.jpg,.jpeg"
            className="hidden"
            onChange={(e) => onUploadAvatar(e.target.files?.[0] || null)}
          />
        </label>
      </div>

      <div className="flex-1">
        <p className="text-sm text-gray-700">
          <span className="font-semibold">{postsCount}</span> posts
        </p>

        <p className="mt-1 text-sm text-gray-700">
          <span className="text-gray-500">Pronoun:</span>{" "}
          {pronoun ? pronoun : <span className="text-gray-400">empty</span>}
        </p>
      </div>
    </div>
  );
}