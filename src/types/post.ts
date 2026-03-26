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
  mediaDataUrl: string;
  caption: string;
  allowComments: boolean;
  allowRepost: boolean;
  createdAt: string;
  likes: string[];
  reposts: string[];
  comments: Comment[];
};