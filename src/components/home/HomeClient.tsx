"use client";

import { useEffect, useMemo, useState, lazy, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import BottomNav from "@/components/BottomNav";
import { Post } from "@/types/post";
import HomeTopBar from "@/components/feed/HomeTopBar";
import ExplorePanel from "@/components/feed/ExplorePanel";
import FeedPostCard from "@/components/feed/FeedPostCard";
import { useExploreSearch } from "@/hooks/useExploreSearch";

// Lazy modals (as you already did)
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
  const tab = searchParams.get("tab") || "";
  const modal = searchParams.get("modal") || "";

  const PAGE_SIZE = initialLimit || 10;

  // logged-in user (stored during login)
  const [currentUser, setCurrentUser] = useState("");
  useEffect(() => {
    const user = window.localStorage.getItem("currentUser") || "";
    setCurrentUser(user);
  }, []);

  // Redux hooks
  const dispatch = useDispatch<AppDispatch>();
  const posts = useSelector((state: RootState) => state.posts.items) as Post[];
  const feedLoading = useSelector((state: RootState) => state.posts.loading) as boolean;
  const feedError = useSelector((state: RootState) => state.posts.error) as string;

  // Pagination state from redux
  const currentPage = useSelector((state: RootState) => state.posts.page) as number;
  const hasMore = useSelector((state: RootState) => state.posts.hasMore) as boolean;

  // ✅ HYBRID: Hydrate Redux from server-fetched page-1 posts (NO first client fetch)
  useEffect(() => {
    if (!posts || posts.length === 0) {
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
    // intentionally not depending on posts to avoid re-hydrating repeatedly
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dispatch, initialPosts, initialPage, initialLimit, initialTotal, initialHasMore]);

  // Explore hook (Users)
  const { query, setQuery, results, searchLoading } = useExploreSearch(tab === "explore");

  // Explore mode toggle
  const [exploreMode, setExploreMode] = useState<"users" | "posts">("users");

  // Posts search state
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

  // Debounced post search (caption OR author)
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

  // UI state for post options menu
  const [postMenuId, setPostMenuId] = useState<string | null>(null);

  // Like/Repost list modal
  const [showList, setShowList] = useState<{ title: string; users: string[] } | null>(null);

  // Comments modal
  const [showComments, setShowComments] = useState<Post | null>(null);

  // Sort mode
  const [sortMode, setSortMode] = useState<"latest" | "trending">("latest");
  function trendingScore(p: Post) {
    return p.likes.length * 2 + p.comments.length * 3 + p.reposts.length * 4;
  }

  const sortedPosts = useMemo(() => {
    const list = [...posts];
    if (sortMode === "latest") {
      return list.sort(
        (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );
    }
    return list.sort((a, b) => trendingScore(b) - trendingScore(a));
  }, [posts, sortMode]);

  // Close create modal by removing modal param from URL
  function closeCreateModal() {
    const params = new URLSearchParams(window.location.search);
    params.delete("modal");
    router.replace(`/home?${params.toString()}`.replace(/\?$/, ""));
  }

  // Minimal mutation handlers (call API then refresh Redux feed)
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

  // Load more handler
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
            {/* Top bar */}
            <HomeTopBar />

            {/* Explore mode */}
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
                {/* Feed mode header */}
                <div className="mt-2 flex items-center justify-between">
                  <p className="text-sm text-gray-600">Feed</p>
                  <select aria-label="Sort posts"
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
                  {feedLoading && posts.length === 0 ? (
                    <p className="text-sm text-gray-600">Loading feed...</p>
                  ) : posts.length === 0 ? (
                    <p className="text-sm text-gray-600">No posts yet. Create your first post ✅</p>
                  ) : null}

                  {sortedPosts.map((p) => (
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
                    />
                  ))}

                  {/* Load more */}
                  {hasMore ? (
                    <button
                      onClick={handleLoadMore}
                      disabled={feedLoading}
                      className="w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm font-semibold text-gray-700 hover:bg-gray-50 disabled:opacity-60"
                    >
                      {feedLoading ? "Loading..." : "Load more"}
                    </button>
                  ) : posts.length > 0 ? (
                    <p className="text-center text-xs text-gray-500">You’ve reached the end ✅</p>
                  ) : null}
                </div>
              </>
            )}
          </div>
        </div>

        <BottomNav />

        {/* Create Post Modal */}
        <CreatePostModal
          open={modal === "create"}
          currentUser={currentUser}
          onClose={closeCreateModal}
          onPosted={async () => {
            dispatch(fetchPosts({ page: 1, limit: PAGE_SIZE, reset: true }));
          }}
        />

        {/* Likes/Reposts List Modal */}
        {showList && (
          <UserListModal
            title={showList.title}
            users={showList.users}
            onClose={() => setShowList(null)}
          />
        )}

        {/* Comments Modal */}
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