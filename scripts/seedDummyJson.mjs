import fs from "fs/promises";
import path from "path";

const ROOT = process.cwd();

const USERS_PATH = path.join(ROOT, "src", "data", "users.json");
const POSTS_PATH = path.join(ROOT, "src", "data", "posts.json");

// Small placeholder image (so posts don't become huge)
const PLACEHOLDER_IMG =
  "data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyMDAiIGhlaWdodD0iMjAwIj48cmVjdCB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgZmlsbD0iI2VlZWVlZSIvPjx0ZXh0IHg9IjUwJSIgeT0iNTAlIiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBmb250LXNpemU9IjE2IiBmaWxsPSIjNjY2Ij5kdW1teTwvdGV4dD48L3N2Zz4=";

function randomISO(daysBack = 45) {
  const now = Date.now();
  const past = now - Math.floor(Math.random() * daysBack) * 24 * 60 * 60 * 1000;
  return new Date(past).toISOString();
}

function pickRandom(arr, n) {
  const copy = [...arr];
  const out = [];
  for (let i = 0; i < n && copy.length > 0; i++) {
    const idx = Math.floor(Math.random() * copy.length);
    out.push(copy.splice(idx, 1)[0]);
  }
  return out;
}

async function main() {
  console.log("Fetching DummyJSON users and posts...");

  // ✅ DummyJSON endpoints (supports limit/skip) [1](https://dummyjson.com/docs/users)[2](https://dummyjson.com/docs/posts)
  const usersRes = await fetch("https://dummyjson.com/users?limit=100&skip=0");
  const usersData = await usersRes.json();

  const postsRes = await fetch("https://dummyjson.com/posts?limit=100&skip=0");
  const postsData = await postsRes.json();

  const dummyUsers = usersData.users || [];
  const dummyPosts = postsData.posts || [];

  // Build username map by dummy user id
  const idToUsername = new Map();
  const usernames = dummyUsers.map((u) => u.username);
  dummyUsers.forEach((u) => idToUsername.set(u.id, u.username));

  // ✅ Convert DummyJSON users → your schema
  // Note: password will be hashed during register, but for dummy users we store a placeholder.
  const users = dummyUsers.map((u) => ({
    username: u.username,
    email: u.email,
    password: "$2a$10$dummypasswordhashONLYfortesting00000000000000000000",
    createdAt: randomISO(120),
    pronoun: "",
    bio: "",
    avatarDataUrl: u.image || "",
  }));

  // ✅ Convert DummyJSON posts → your schema
  // DummyJSON posts contain {id,title,body,userId,tags,reactions} [2](https://dummyjson.com/docs/posts)
  // We'll map:
  // author = username based on userId
  // caption = title + body
  // likes = random usernames based on reactions count (cap it)
  // comments = empty (can be added later)
  // reposts = random few
  const posts = dummyPosts.map((p) => {
    const author = idToUsername.get(p.userId) || "unknown";

    const likesCount = Math.min(Number(p.reactions || 0), 25);
    const likes = pickRandom(usernames, likesCount);

    const reposts = pickRandom(usernames, Math.min(Math.floor(likesCount / 5), 6));

    return {
      id: `dj-${p.id}`, // keep unique, avoids clash with your created posts
      author,
      mediaType: "image",
      mediaDataUrl: PLACEHOLDER_IMG,
      caption: `${p.title} — ${p.body}`,
      allowComments: true,
      allowRepost: true,
      createdAt: randomISO(45),
      likes,
      reposts,
      comments: [],
    };
  });

  // ✅ Ensure folders exist
  await fs.mkdir(path.join(ROOT, "src", "data"), { recursive: true });

  // ✅ Write files
  await fs.writeFile(USERS_PATH, JSON.stringify(users, null, 2), "utf-8");
  await fs.writeFile(POSTS_PATH, JSON.stringify(posts, null, 2), "utf-8");

  console.log("✅ Seed complete!");
  console.log("Users:", users.length);
  console.log("Posts:", posts.length);
  console.log("Written:", USERS_PATH);
  console.log("Written:", POSTS_PATH);
}

main().catch((e) => {
  console.error("❌ Seed failed:", e);
  process.exit(1);
});