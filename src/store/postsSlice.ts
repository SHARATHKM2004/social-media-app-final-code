import { createAsyncThunk, createSlice, PayloadAction } from "@reduxjs/toolkit";
import { Post } from "@/types/post";

type FetchPostsArgs = {
  page?: number;
  limit?: number;
  username?: string;
  reset?: boolean;

  // ✅ default false (payload-friendly)
  includeMedia?: boolean;
};

type FetchPostsResponse = {
  posts: Post[];
  page: number;
  limit: number;
  total: number;
  hasMore: boolean;
  reset: boolean;
};

type PostsState = {
  items: Post[];
  loading: boolean;
  error: string;
  page: number;
  limit: number;
  total: number;
  hasMore: boolean;
};

const initialState: PostsState = {
  items: [],
  loading: false,
  error: "",
  page: 1,
  limit: 5,
  total: 0,
  hasMore: false,
};

export const fetchPosts = createAsyncThunk<
  FetchPostsResponse,
  FetchPostsArgs | void,
  { rejectValue: string }
>("posts/fetchPosts", async (args, thunkAPI) => {
  try {
    const page = args?.page ?? 1;
    const limit = args?.limit ?? 5;
    const username = args?.username ?? "";
    const reset = !!args?.reset;

    const includeMedia = !!args?.includeMedia;

    const params = new URLSearchParams();
    params.set("page", String(page));
    params.set("limit", String(limit));
    if (username) params.set("username", username);

    params.set("includeMedia", includeMedia ? "1" : "0");

    // ✅ IMPORTANT: no-store so UI doesn’t get stale likes/reposts
    const res = await fetch(`/api/posts?${params.toString()}`, { cache: "no-store" });
    const data = await res.json();

    if (!res.ok) {
      return thunkAPI.rejectWithValue(data?.error || "Failed to fetch posts");
    }

    return {
      posts: (data.posts || []) as Post[],
      page: data.page ?? page,
      limit: data.limit ?? limit,
      total: data.total ?? 0,
      hasMore: !!data.hasMore,
      reset,
    };
  } catch {
    return thunkAPI.rejectWithValue("Network error while fetching posts");
  }
});

type InitialPostsPayload = {
  posts: Post[];
  page: number;
  limit: number;
  total: number;
  hasMore: boolean;
};

const postsSlice = createSlice({
  name: "posts",
  initialState,
  reducers: {
    // ✅ Hydrate Redux from SSR without fetching again
    setInitialPosts: (state, action: PayloadAction<InitialPostsPayload>) => {
      const { posts, page, limit, total, hasMore } = action.payload;

      state.items = posts;
      state.page = page;
      state.limit = limit;
      state.total = total;
      state.hasMore = hasMore;

      state.loading = false;
      state.error = "";
    },

    // ✅ NEW: Optimistic Like toggle (UI updates instantly)
    updatePostLike: (
      state,
      action: PayloadAction<{ postId: string; user: string }>
    ) => {
      const { postId, user } = action.payload;
      const post = state.items.find((p) => p.id === postId);
      if (!post) return;

      if (post.likes.includes(user)) {
        post.likes = post.likes.filter((u) => u !== user);
      } else {
        post.likes.push(user);
      }
    },

    // ✅ NEW: Optimistic Repost toggle (UI updates instantly)
    updatePostRepost: (
      state,
      action: PayloadAction<{ postId: string; user: string }>
    ) => {
      const { postId, user } = action.payload;
      const post = state.items.find((p) => p.id === postId);
      if (!post) return;

      if (post.reposts.includes(user)) {
        post.reposts = post.reposts.filter((u) => u !== user);
      } else {
        post.reposts.push(user);
      }
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchPosts.pending, (state) => {
        state.loading = true;
        state.error = "";
      })
      .addCase(fetchPosts.fulfilled, (state, action) => {
        state.loading = false;

        const { posts, page, limit, total, hasMore, reset } = action.payload;

        state.page = page;
        state.limit = limit;
        state.total = total;
        state.hasMore = hasMore;

        if (reset || page === 1) {
          state.items = posts;
          return;
        }

        // Append without duplicating IDs
        const existingIds = new Set(state.items.map((p) => p.id));
        const next = posts.filter((p) => !existingIds.has(p.id));
        state.items = [...state.items, ...next];
      })
      .addCase(fetchPosts.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || "Something went wrong";
      });
  },
});

// ✅ Export new actions also
export const { setInitialPosts, updatePostLike, updatePostRepost } = postsSlice.actions;
export default postsSlice.reducer;