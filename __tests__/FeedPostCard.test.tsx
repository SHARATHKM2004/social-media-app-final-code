
import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import FeedPostCard from "@/components/feed/FeedPostCard";

// ✅ Mock PostOptionsMenu to avoid clipboard/share/window click listeners
jest.mock("@/components/feed/PostOptionsMenu", () => ({
  __esModule: true,
  default: function MockPostOptionsMenu(props: any) {
    return (
      <button data-testid="post-options" onClick={props.onToggle}>
        options
      </button>
    );
  },
}));

// ✅ Mock timeAgo to make test deterministic
jest.mock("@/lib/client/time", () => ({
  timeAgo: () => "just now",
}));

const basePost: any = {
  id: "p1",
  author: "Sharath",
  createdAt: new Date().toISOString(),
  caption: "Hello from test",
  mediaType: "image",
  mediaDataUrl: "data:image/png;base64,AAA",
  likes: [],
  comments: [],
  reposts: [],
  allowComments: true,
  allowRepost: true,
};

test("FeedPostCard renders author and caption", () => {
  render(
    <FeedPostCard
      post={basePost}
      postMenuOpen={false}
      onToggleMenu={() => {}}
      onCloseMenu={() => {}}
      onLike={() => {}}
      onOpenComments={() => {}}
      onRepost={() => {}}
      onShowLikes={() => {}}
      onShowReposts={() => {}}
    />
  );

  expect(screen.getByText("Sharath")).toBeInTheDocument();
  expect(screen.getByText("Hello from test")).toBeInTheDocument();
  expect(screen.getByText("just now")).toBeInTheDocument();
});

test("Clicking Like button calls onLike", () => {
  const onLike = jest.fn();

  render(
    <FeedPostCard
      post={basePost}
      postMenuOpen={false}
      onToggleMenu={() => {}}
      onCloseMenu={() => {}}
      onLike={onLike}
      onOpenComments={() => {}}
      onRepost={() => {}}
      onShowLikes={() => {}}
      onShowReposts={() => {}}
    />
  );

fireEvent.click(screen.getByText(/^❤️ Like$/));
  expect(onLike).toHaveBeenCalledTimes(1);
});