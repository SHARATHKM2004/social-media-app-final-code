"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function ExplorePage() {
  const router = useRouter();
  useEffect(() => {
    router.replace("/home?tab=explore");
  }, [router]);
  return null;
}