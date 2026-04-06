export type Comment = {
  id: string;
  username: string;
  text: string;
  createdAt: string;
};

export type Post = {
  id: string;
  author: string;

  mediaType: "image" | "video";

  // ✅ Optional because for profile/grid we won’t send base64
  mediaDataUrl?: string;

  // ✅ Added: helps UI know media exists even if base64 not included
  hasMedia?: boolean;

  caption: string;
  allowComments: boolean;
  allowRepost: boolean;
  createdAt: string;
  likes: string[];
  reposts: string[];
  comments: Comment[];
};