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

// ✅ Notifications modal
const NotificationsModal = lazy(() => import("@/components/notifications/NotificationsModal"));
import type { NotificationItem } from "@/components/notifications/NotificationsModal";

// ✅ Stories components
const StoriesTray = lazy(() => import("@/components/stories/StoriesTray"));
const StoryUploadModal = lazy(() => import("@/components/stories/StoryUploadModal"));
const StoryViewerModal = lazy(() => import("@/components/stories/StoryViewerModal"));

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
  const focusPostId = searchParams?.get("postId") || "";

  const PAGE_SIZE = initialLimit || 10;

  // logged-in user
  const [currentUser, setCurrentUser] = useState("");
  useEffect(() => {
    const user = window.localStorage.getItem("currentUser") || "";
    setCurrentUser(user);
  }, []);

  // ✅ Stories state
  const [storiesRefreshKey, setStoriesRefreshKey] = useState(0);
  const [uploadOpen, setUploadOpen] = useState(false);
  const [viewerOpen, setViewerOpen] = useState(false);
  const [viewerUser, setViewerUser] = useState("");

  // ✅ Local fallback posts
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
  const posts = useSelector((state: RootState) => state.posts.items) as Post[];
  const feedLoading = useSelector((state: RootState) => state.posts.loading) as boolean;
  const feedError = useSelector((state: RootState) => state.posts.error) as string;
  const currentPage = useSelector((state: RootState) => state.posts.page) as number;
  const hasMore = useSelector((state: RootState) => state.posts.hasMore) as boolean;

  // ✅ Hydrate Redux only when SSR provided posts
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

  // ✅ Auto-fetch ONCE when SSR initialPosts is empty (fix empty feed)
  const didAutoFetch = useRef(false);
  useEffect(() => {
    if (didAutoFetch.current) return;
    if (tab === "explore") return;
    if (initialPosts && initialPosts.length > 0) return;
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
          setClientPosts(list);
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
        // silent
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

  // ✅ Effective posts
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

  // If user deep-links to a post, ensure we render all posts
  useEffect(() => {
    if (focusPostId) setRenderAllPosts(true);
  }, [focusPostId]);

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

  // ---------------------------
  // ✅ Notifications wiring (unchanged)
  // ---------------------------
  const [notifOpen, setNotifOpen] = useState(false);
  const [notifLoading, setNotifLoading] = useState(false);
  const [notifItems, setNotifItems] = useState<NotificationItem[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);

  async function loadNotifications() {
    if (!currentUser) return;
    setNotifLoading(true);
    try {
      const res = await fetch(`/api/notifications?user=${encodeURIComponent(currentUser)}&limit=50`, {
        cache: "no-store",
      });
      const data = await res.json().catch(() => ({}));
      if (res.ok) {
        setNotifItems((data.items || []) as NotificationItem[]);
        setUnreadCount(Number(data.unreadCount || 0));
      }
    } finally {
      setNotifLoading(false);
    }
  }

  useEffect(() => {
    if (!currentUser) return;
    const tick = async () => loadNotifications();
    tick();
    const id = window.setInterval(tick, 5000);
    return () => window.clearInterval(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentUser]);

  async function markAllNotificationsRead() {
    if (!currentUser) return;
    await fetch("/api/notifications/read", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ user: currentUser }),
    }).catch(() => null);

    setUnreadCount(0);
    setNotifItems((prev) => prev.map((x) => ({ ...x, read: true })));
  }

  async function openNotifications() {
    setNotifOpen(true);
    await loadNotifications();
    if (unreadCount > 0) await markAllNotificationsRead();
  }

  function closeNotifications() {
    setNotifOpen(false);
  }

  function onOpenNotificationItem(n: NotificationItem) {
    if (n.type === "story_like") {
  setNotifOpen(false);
  setViewerUser(currentUser); // open YOUR story
  setViewerOpen(true);
  return;
}
    setNotifOpen(false);
    
    const params = new URLSearchParams(window.location.search);
    params.delete("tab");
    params.delete("modal");
    params.set("postId", n.postId);
    router.push(`/home?${params.toString()}`);
    
  }

  // scroll + highlight
  useEffect(() => {
    if (!focusPostId) return;
    const t = window.setTimeout(() => {
      const el = document.getElementById(`post-${focusPostId}`);
      if (el) {
        el.scrollIntoView({ behavior: "smooth", block: "center" });
        el.classList.add("ring-2", "ring-brand-blue");
        window.setTimeout(() => el.classList.remove("ring-2", "ring-brand-blue"), 2000);
      }
    }, 600);
    return () => window.clearTimeout(t);
  }, [focusPostId, renderAllPosts]);

  // ---------------------------
  // ✅ Stories handlers
  // ---------------------------
  function openUserStory(username: string) {
    setViewerUser(username);
    setViewerOpen(true);
  }

  function openUpload() {
    setUploadOpen(true);
  }

  function refreshStories() {
    setStoriesRefreshKey((v) => v + 1);
  }

  return (
    <Suspense fallback={<div>Loading...</div>}>
      <main className="min-h-screen bg-neutral-50 pb-16">
        <div className="mx-auto max-w-md p-5">
          <div className="rounded-3xl border-2 border-brand-blue bg-white p-5 shadow-soft">
            <HomeTopBar unreadCount={unreadCount} onOpenNotifications={openNotifications} />

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
                {/* ✅ Stories tray at top of feed */}
                <Suspense fallback={null}>
                  <StoriesTray
                    currentUser={currentUser}
                    refreshKey={storiesRefreshKey}
                    onOpenUser={openUserStory}
                    onOpenUpload={openUpload}
                  />
                </Suspense>

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
                    <div key={p.id} id={`post-${p.id}`} className="rounded-2xl">
                      <FeedPostCard
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
                    </div>
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
          <UserListModal title={showList.title} users={showList.users} onClose={() => setShowList(null)} />
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

        {/* Notifications Modal */}
        <Suspense fallback={null}>
          <NotificationsModal
            open={notifOpen}
            items={notifItems}
            loading={notifLoading}
            onClose={closeNotifications}
            onOpenItem={onOpenNotificationItem}
            onMarkAllRead={markAllNotificationsRead}
          />
        </Suspense>

        {/* ✅ Story Upload Modal */}
        <Suspense fallback={null}>
          <StoryUploadModal
            open={uploadOpen}
            currentUser={currentUser}
            onClose={() => setUploadOpen(false)}
            onUploaded={() => {
              refreshStories();
            }}
          />
        </Suspense>

        {/* ✅ Story Viewer Modal */}
        <Suspense fallback={null}>
          <StoryViewerModal
            open={viewerOpen}
            viewer={currentUser}
            username={viewerUser}
            onClose={() => setViewerOpen(false)}
            onSeen={() => refreshStories()}
          />
        </Suspense>
      </main>
    </Suspense>
  );
}