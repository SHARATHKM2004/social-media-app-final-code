"use client";

export default function ProfileBio({ bio }: { bio: string }) {
  return (
    <div className="mt-4 rounded-2xl bg-neutral-50 p-4">
      <p className="text-sm text-gray-700">
        <span className="font-semibold">Bio:</span>{" "}
        {bio ? bio : <span className="text-gray-400">empty</span>}
      </p>
    </div>
  );
}