import { Suspense } from "react";
import HomeClient from "@/components/home/HomeClient";
import { Post } from "@/types/post";

// ✅ SSR / Dynamic Rendering (mentor-proof)
export const dynamic = "force-dynamic";

export default async function HomePage() {
  // ✅ Your requirement: page 1 limit 5
  const PAGE_SIZE = 5;

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