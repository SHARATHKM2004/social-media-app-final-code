"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";

export default function PublicProfilePage() {
  const router = useRouter();
  const params = useParams<{ username: string }>();
  const usernameParam = decodeURIComponent(params.username || "");
  

  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState<{
    username: string;
    pronoun: string;
    bio: string;
    avatarDataUrl: string;
  } | null>(null);

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch("/api/profile", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ username: usernameParam }),
        });
        const data = await res.json();
        if (res.ok) {
          setProfile({
            username: data.profile.username,
            pronoun: data.profile.pronoun || "",
            bio: data.profile.bio || "",
            avatarDataUrl: data.profile.avatarDataUrl || "",
          });
        } else {
          setProfile(null);
        }
const postsRes = await fetch(`/api/posts?username=${encodeURIComponent(usernameParam)}`);
const postsData = await postsRes.json();
      } 
      finally {
        setLoading(false);
      }
    }
    load();
  }, [usernameParam]);

  return (
    <main className="min-h-screen bg-neutral-50">
      <div className="mx-auto max-w-md p-5">
        <div className="rounded-3xl border-2 border-brand-blue bg-white p-5 shadow-soft">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-xl font-bold text-gray-900">Profile</h1>
              <p className="text-xs text-brand-gray">Mini Social</p>
            </div>

            <button
              onClick={() => router.back()}
              className="rounded-xl border border-gray-200 bg-white px-3 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-50"
            >
              Back
            </button>
          </div>

          {loading ? (
            <p className="mt-6 text-sm text-gray-600">Loading...</p>
          ) : !profile ? (
            <p className="mt-6 text-sm text-red-600">User not found.</p>
          ) : (
            <>
              <div className="mt-6 flex items-center gap-4">
                <div className="h-20 w-20 overflow-hidden rounded-full border border-gray-200 bg-neutral-100">
                  {profile.avatarDataUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={profile.avatarDataUrl}
                      alt="avatar"
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center text-2xl">
                      🙂
                    </div>
                  )}
                </div>

                <div className="flex-1">
                  <p className="text-base font-semibold text-gray-900">
                    {profile.username}
                  </p>
                  <p className="mt-1 text-sm text-gray-700">
                    <span className="text-gray-500">Pronoun:</span>{" "}
                    {profile.pronoun || (
                      <span className="text-gray-400">empty</span>
                    )}
                  </p>
                </div>
              </div>

              <div className="mt-4 rounded-2xl bg-neutral-50 p-4">
                <p className="text-sm text-gray-700">
                  <span className="font-semibold">Bio:</span>{" "}
                  {profile.bio || <span className="text-gray-400">empty</span>}
                </p>
              </div>
            </>
          )}
        </div>
      </div>
    </main>
  );
}