import { Post } from "@/types/post";

export const revalidate = 60; // ✅ ISR: page regenerates every 60 seconds

type Profile = {
  username: string;
  pronoun?: string;
  bio?: string;
  avatarDataUrl?: string;
};

export default async function PublicProfilePage({
  params,
}: {
  params: Promise<{ username: string }>; // ✅ IMPORTANT: params is Promise (fixes build)
}) {
  const { username } = await params;
  const usernameParam = username ? decodeURIComponent(username) : "";

  // ✅ Build absolute base URL safely (works local + vercel without extra env)
  const baseUrl =
    process.env.NEXT_PUBLIC_BASE_URL ||
    process.env.VERCEL_URL?.startsWith("http")
      ? process.env.VERCEL_URL!
      : process.env.VERCEL_URL
      ? `https://${process.env.VERCEL_URL}`
      : "http://localhost:3000";

  // ✅ Fetch profile (server-side)
  const profileRes = await fetch(`${baseUrl}/api/profile`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ username: usernameParam }),
    next: { revalidate: 60 },
  });

  const profileData = await profileRes.json().catch(() => null);

  const profile: Profile | null =
    profileRes.ok && profileData?.profile
      ? {
          username: profileData.profile.username,
          pronoun: profileData.profile.pronoun ?? "",
          bio: profileData.profile.bio ?? "",
          avatarDataUrl: profileData.profile.avatarDataUrl ?? "",
        }
      : null;

  // ✅ Fetch user's posts (server-side)
  const postsRes = await fetch(
    `${baseUrl}/api/posts?username=${encodeURIComponent(usernameParam)}&page=1&limit=5`,
    { next: { revalidate: 60 } }
  );

  const postsData = await postsRes.json().catch(() => null);
  const userPosts: Post[] = postsRes.ok ? (postsData?.posts ?? []) : [];
  const postsCount = userPosts.length;

  return (
    <main className="min-h-screen bg-neutral-50 p-5">
      <div className="mx-auto max-w-md rounded-3xl border-2 border-brand-blue bg-white p-5 shadow-soft">
        <h2 className="text-lg font-bold text-gray-800">Profile</h2>
        <p className="text-xs text-gray-500">Mini Social</p>

        <div className="mt-4">
          {!profile ? (
            <p className="text-sm text-gray-700">User not found.</p>
          ) : (
            <>
              <div className="flex items-center gap-3">
                {profile.avatarDataUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={profile.avatarDataUrl}
                    alt="avatar"
                    className="h-14 w-14 rounded-full object-cover"
                  />
                ) : (
                  <div className="flex h-14 w-14 items-center justify-center rounded-full bg-gray-100">
                    🙂
                  </div>
                )}

                <div>
                  <div className="text-base font-semibold text-gray-900">{profile.username}</div>
                  <div className="text-xs text-gray-600">
                    Pronoun:{" "}
                    <span className="font-semibold">{profile.pronoun || "(empty)"}</span>
                  </div>
                </div>
              </div>

              <div className="mt-3 text-sm text-gray-700">
                Bio: <span className="font-semibold">{profile.bio || "empty"}</span>
              </div>

              <div className="mt-2 text-sm font-semibold text-gray-800">{postsCount} posts</div>

              <h3 className="mt-4 text-sm font-bold text-gray-800">Posts</h3>

              {userPosts.length === 0 ? (
                <p className="mt-2 text-sm text-gray-600">No posts yet.</p>
              ) : (
                <div className="mt-3 grid grid-cols-2 gap-3">
                  {userPosts.map((p) => (
                    <div key={p.id} className="overflow-hidden rounded-xl border border-gray-200">
                      {p.mediaType === "image" ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={p.mediaDataUrl}
                          alt="post"
                          className="h-40 w-full object-cover"
                          loading="lazy"
                        />
                      ) : (
                        // eslint-disable-next-line @next/next/no-img-element
                        <video src={p.mediaDataUrl} controls className="h-40 w-full object-cover" />
                      )}
                    </div>
                  ))}
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </main>
  );
}
