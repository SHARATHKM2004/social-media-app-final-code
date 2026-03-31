import { Suspense } from "react";
import HomeClient from "@/components/home/HomeClient";
import { Post } from "@/types/post";

export default async function HomePage() {
  const PAGE_SIZE = 10;

  return (
    <Suspense fallback={<div>Loading...</div>}>
      <HomeClient
        initialPosts={[] as Post[]}
        initialPage={1}
        initialLimit={PAGE_SIZE}
        initialTotal={0}
        initialHasMore={true}
      />
    </Suspense>
  );
}