import HomeClient from "@/components/home/HomeClient";
import { Post } from "@/types/post";

export default async function HomePage() {
  const PAGE_SIZE = 10;

  const res = await fetch(
    `${process.env.NEXT_PUBLIC_BASE_URL || ""}/api/posts?page=1&limit=${PAGE_SIZE}`,
    { cache: "no-store" }
  );

  const data = await res.json().catch(() => ({}));

  return (
    <HomeClient
      initialPosts={(data?.posts || []) as Post[]}
      initialPage={data?.page ?? 1}
      initialLimit={data?.limit ?? PAGE_SIZE}
      initialTotal={data?.total ?? 0}
      initialHasMore={!!data?.hasMore}
    />
  );
}