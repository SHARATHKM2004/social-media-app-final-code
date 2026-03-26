import { createAsyncThunk, createSlice, PayloadAction } from "@reduxjs/toolkit";
import { Post } from "@/types/post";

type FetchPostsArgs = {
  page?: number;
  limit?: number;
  username?: string;
  reset?: boolean; // if true, replace items
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
  limit: 10,
  total: 0,
  hasMore: false,
};

// try/catch included (mentor asked)
export const fetchPosts = createAsyncThunk<
  FetchPostsResponse,
  FetchPostsArgs | void,
  { rejectValue: string }
>("posts/fetchPosts", async (args, thunkAPI) => {
  try {
    const page = args && args.page ? args.page : 1;
    const limit = args && args.limit ? args.limit : 10;
    const username = args && args.username ? args.username : "";
    const reset = !!(args && args.reset);

    const params = new URLSearchParams();
    params.set("page", String(page));
    params.set("limit", String(limit));
    if (username) params.set("username", username);

    const res = await fetch(`/api/posts?${params.toString()}`);
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
    // ✅ NEW: hydrate Redux from SSR without fetching again
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

        // Append without duplicating existing IDs
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

export const { setInitialPosts } = postsSlice.actions;
export default postsSlice.reducer;