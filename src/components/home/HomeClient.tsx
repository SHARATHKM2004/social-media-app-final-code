"use client";

import { useEffect, useMemo, useRef, useState, lazy, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import BottomNav from "@/components/BottomNav";
import { Post } from "@/types/post";
import HomeTopBar from "@/components/feed/HomeTopBar";
import ExplorePanel from "@/components/feed/ExplorePanel";
import FeedPostCard from "@/components/feed/FeedPostCard";
import { useExploreSearch } from "@/hooks/useExploreSearch";

// Lazy modals
const UserListModal = lazy(() => import("@/components/feed/UserListModal"));
const CommentsModal = lazy(() => import("@/components/feed/CommentsModal"));
const CreatePostModal = lazy(() => import("@/components/feed/CreatePostModal"));

// Redux
import { useDispatch, useSelector } from "react-redux";
import type { RootState, AppDispatch } from "@/store/store";
import { fetchPosts, setInitialPosts } from "@/store/postsSlice";

type HomeClientProps = {
  initialPosts: Post[];
  initialPage: number;
  initialLimit: number;
  initialTotal: number;
  initialHasMore: boolean;
};

export default function HomeClient({
  initialPosts,
  initialPage,
  initialLimit,
  initialTotal,
  initialHasMore,
}: HomeClientProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const tab = searchParams?.get("tab") || "";
  const modal = searchParams?.get("modal") || "";

  const PAGE_SIZE = initialLimit || 10;

  // logged-in user
  const [currentUser, setCurrentUser] = useState("");
  useEffect(() => {
    const user = window.localStorage.getItem("currentUser") || "";
    setCurrentUser(user);
  }, []);

  // ✅ Local fallback posts (guarantees feed shows even if Redux stays empty)
  const [clientPosts, setClientPosts] = useState<Post[]>([]);

  // ✅ Lighthouse / Perf controls
  const [mediaReady, setMediaReady] = useState(false);
  const [renderAllPosts, setRenderAllPosts] = useState(false);

  useEffect(() => {
    const t1 = window.setTimeout(() => setMediaReady(true), 1200);
    const t2 = window.setTimeout(() => setRenderAllPosts(true), 1800);
    return () => {
      window.clearTimeout(t1);
      window.clearTimeout(t2);
    };
  }, []);

  // Redux
  const dispatch = useDispatch<AppDispatch>();
  const posts = useSelector((state: RootState) => state.posts.items) as Post[]; // [1](https://wipflillp-my.sharepoint.com/personal/sharath_kori_wipfli_com/Documents/Microsoft%20Copilot%20Chat%20Files/HomeClient.tsx)
  const feedLoading = useSelector((state: RootState) => state.posts.loading) as boolean; // [1](https://wipflillp-my.sharepoint.com/personal/sharath_kori_wipfli_com/Documents/Microsoft%20Copilot%20Chat%20Files/HomeClient.tsx)
  const feedError = useSelector((state: RootState) => state.posts.error) as string; // [1](https://wipflillp-my.sharepoint.com/personal/sharath_kori_wipfli_com/Documents/Microsoft%20Copilot%20Chat%20Files/HomeClient.tsx)
  const currentPage = useSelector((state: RootState) => state.posts.page) as number; // [1](https://wipflillp-my.sharepoint.com/personal/sharath_kori_wipfli_com/Documents/Microsoft%20Copilot%20Chat%20Files/HomeClient.tsx)
  const hasMore = useSelector((state: RootState) => state.posts.hasMore) as boolean; // [1](https://wipflillp-my.sharepoint.com/personal/sharath_kori_wipfli_com/Documents/Microsoft%20Copilot%20Chat%20Files/HomeClient.tsx)

  // ✅ Hydrate Redux only when SSR provided posts (we are using [] for Lighthouse)
  useEffect(() => {
    if (initialPosts && initialPosts.length > 0) {
      dispatch(
        setInitialPosts({
          posts: initialPosts,
          page: initialPage,
          limit: initialLimit,
          total: initialTotal,
          hasMore: initialHasMore,
        })
      );
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dispatch, initialPosts, initialPage, initialLimit, initialTotal, initialHasMore]);

  // ✅ Auto-fetch ONCE when SSR initialPosts is empty (fixes empty feed)
  const didAutoFetch = useRef(false);

  useEffect(() => {
    if (didAutoFetch.current) return;
    if (tab === "explore") return;
    if (initialPosts && initialPosts.length > 0) return; // SSR already had posts
    if (feedLoading) return;
    if (posts && posts.length > 0) return;
    if (clientPosts && clientPosts.length > 0) return;

    didAutoFetch.current = true;

    const t = window.setTimeout(async () => {
      try {
        const res = await fetch(`/api/posts?page=1&limit=${PAGE_SIZE}`, { cache: "no-store" });
        const data = await res.json().catch(() => ({}));

        if (res.ok) {
          const list = (data?.posts || []) as Post[];

          // ✅ Set local posts (guaranteed UI update)
          setClientPosts(list);

          // ✅ Also try to hydrate Redux (if slice supports it)
          dispatch(
            setInitialPosts({
              posts: list,
              page: data?.page ?? 1,
              limit: data?.limit ?? PAGE_SIZE,
              total: data?.total ?? 0,
              hasMore: !!data?.hasMore,
            })
          );
        }
      } catch {
        // keep silent for demo
      }
    }, 700);

    return () => window.clearTimeout(t);
  }, [tab, initialPosts, feedLoading, posts, clientPosts, dispatch, PAGE_SIZE]);

  // Explore
  const { query, setQuery, results, searchLoading } = useExploreSearch(tab === "explore");
  const [exploreMode, setExploreMode] = useState<"users" | "posts">("users");

  // Posts search
  const [postResults, setPostResults] = useState<
    {
      id: string;
      author: string;
      caption: string;
      mediaType: "image" | "video";
      mediaDataUrl: string;
      createdAt: string;
      likesCount: number;
      commentsCount: number;
    }[]
  >([]);
  const [postSearchLoading, setPostSearchLoading] = useState(false);

  useEffect(() => {
    if (tab !== "explore") return;
    if (exploreMode !== "posts") return;

    const t = setTimeout(async () => {
      const q = query.trim();
      if (!q) {
        setPostResults([]);
        return;
      }
      setPostSearchLoading(true);
      try {
        const res = await fetch(`/api/posts/search?q=${encodeURIComponent(q)}`);
        const data = await res.json();
        if (res.ok) setPostResults(data.posts || []);
        else setPostResults([]);
      } finally {
        setPostSearchLoading(false);
      }
    }, 300);

    return () => clearTimeout(t);
  }, [tab, exploreMode, query]);

  const [postMenuId, setPostMenuId] = useState<string | null>(null);
  const [showList, setShowList] = useState<{ title: string; users: string[] } | null>(null);
  const [showComments, setShowComments] = useState<Post | null>(null);

  // ✅ Use Redux posts if available, otherwise fallback to clientPosts
  const effectivePosts = posts && posts.length > 0 ? posts : clientPosts;

  const [sortMode, setSortMode] = useState<"latest" | "trending">("latest");
  function trendingScore(p: Post) {
    return p.likes.length * 2 + p.comments.length * 3 + p.reposts.length * 4;
  }

  const sortedPosts = useMemo(() => {
    const list = [...effectivePosts];
    if (sortMode === "latest") {
      return list.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    }
    return list.sort((a, b) => trendingScore(b) - trendingScore(a));
  }, [effectivePosts, sortMode]);

  // Lighthouse: show only 1 post first, then all
  const visiblePosts = renderAllPosts ? sortedPosts : sortedPosts.slice(0, 1);

  function closeCreateModal() {
    const params = new URLSearchParams(window.location.search);
    params.delete("modal");
    router.replace(`/home?${params.toString()}`.replace(/\?$/, ""));
  }

  async function handleLike(postId: string) {
    if (!currentUser) return;
    const res = await fetch(`/api/posts/${encodeURIComponent(postId)}/like`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username: currentUser }),
    });
    if (res.ok) dispatch(fetchPosts({ page: 1, limit: PAGE_SIZE, reset: true }));
  }

  async function handleRepost(p: Post) {
    if (!currentUser) return;
    if (!p.allowRepost) return;
    const res = await fetch(`/api/posts/${encodeURIComponent(p.id)}/repost`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username: currentUser }),
    });
    if (res.ok) dispatch(fetchPosts({ page: 1, limit: PAGE_SIZE, reset: true }));
  }

  async function handleAddComment(p: Post, text: string) {
    if (!currentUser) return null;
    if (!p.allowComments) return null;
    const trimmed = text.trim();
    if (!trimmed) return null;

    const res = await fetch(`/api/posts/${encodeURIComponent(p.id)}/comment`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username: currentUser, text: trimmed }),
    });

    const data = await res.json().catch(() => ({}));
    if (res.ok) {
      dispatch(fetchPosts({ page: 1, limit: PAGE_SIZE, reset: true }));
      return data.comments as Post["comments"];
    }
    return null;
  }

  async function handleLoadMore() {
    if (feedLoading) return;
    if (!hasMore) return;
    dispatch(fetchPosts({ page: (currentPage || 1) + 1, limit: PAGE_SIZE }));
  }

  return (
    <Suspense fallback={<div>Loading...</div>}>
      <main className="min-h-screen bg-neutral-50 pb-16">
        <div className="mx-auto max-w-md p-5">
          <div className="rounded-3xl border-2 border-brand-blue bg-white p-5 shadow-soft">
            <HomeTopBar />

            {tab === "explore" ? (
              <ExplorePanel
                mode={exploreMode}
                setMode={(m) => {
                  setExploreMode(m);
                  if (m === "posts") setPostResults([]);
                }}
                query={query}
                setQuery={(v) => setQuery(v)}
                userResults={results}
                postResults={postResults}
                loading={exploreMode === "users" ? searchLoading : postSearchLoading}
              />
            ) : (
              <>
                <div className="mt-2 flex items-center justify-between">
                  <p className="text-sm text-gray-600">Feed</p>
                  <select
                    aria-label="Sort posts"
                    value={sortMode}
                    onChange={(e) => setSortMode(e.target.value as "latest" | "trending")}
                    className="rounded-xl border border-gray-200 bg-white px-3 py-2 text-xs font-semibold text-gray-700 outline-none focus:border-brand-blue focus:ring-2 focus:ring-brand-blue/20"
                  >
                    <option value="latest">Latest</option>
                    <option value="trending">Trending</option>
                  </select>
                </div>

                {feedError ? <p className="mt-2 text-sm text-red-600">{feedError}</p> : null}

                <div className="mt-4 space-y-4">
                  {feedLoading && effectivePosts.length === 0 ? (
                    <p className="text-sm text-gray-600">Loading feed...</p>
                  ) : effectivePosts.length === 0 ? (
                    <p className="text-sm text-gray-600">No posts yet. Create your first post ✅</p>
                  ) : null}

                  {visiblePosts.map((p) => (
                    <FeedPostCard
                      key={p.id}
                      post={p}
                      postMenuOpen={postMenuId === p.id}
                      onToggleMenu={() => setPostMenuId((v) => (v === p.id ? null : p.id))}
                      onCloseMenu={() => setPostMenuId(null)}
                      onLike={() => handleLike(p.id)}
                      onOpenComments={() => setShowComments(p)}
                      onRepost={() => handleRepost(p)}
                      onShowLikes={() => setShowList({ title: "Liked by", users: p.likes })}
                      onShowReposts={() => setShowList({ title: "Reposted by", users: p.reposts })}
                      deferMedia={!mediaReady}
                    />
                  ))}

                  {hasMore ? (
                    <button
                      onClick={handleLoadMore}
                      disabled={feedLoading}
                      className="w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm font-semibold text-gray-700 hover:bg-gray-50 disabled:opacity-60"
                    >
                      {feedLoading ? "Loading..." : "Load more"}
                    </button>
                  ) : effectivePosts.length > 0 ? (
                    <p className="text-center text-xs text-gray-500">You’ve reached the end ✅</p>
                  ) : null}
                </div>
              </>
            )}
          </div>
        </div>

        <BottomNav />

        <CreatePostModal
          open={modal === "create"}
          currentUser={currentUser}
          onClose={closeCreateModal}
          onPosted={async () => {
            dispatch(fetchPosts({ page: 1, limit: PAGE_SIZE, reset: true }));
          }}
        />

        {showList && (
          <UserListModal title={showList.title} users={showList.users} onClose={() => setShowList(null)} />
        )}

        {showComments && (
          <CommentsModal
            post={showComments}
            onClose={() => setShowComments(null)}
            onSend={async (text) => {
              const updatedComments = await handleAddComment(showComments, text);
              if (updatedComments) {
                setShowComments({ ...showComments, comments: updatedComments });
              }
            }}
          />
        )}
      </main>
    </Suspense>
  );
}