"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Post } from "@/types/post";

export default function PostPage() {
  const router = useRouter();
  const params = useParams<{ id?: string }>();
const id = params?.id || "";


  const [loading, setLoading] = useState(true);
  const [post, setPost] = useState<Post>();

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch(`/api/posts/${encodeURIComponent(id)}`);
        const data = await res.json();
        if (res.ok) setPost(data.post);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [id]);

  return (
    <main className="min-h-screen bg-neutral-50">
      <div className="mx-auto max-w-md p-5">
        <div className="rounded-3xl border-2 border-brand-blue bg-white p-5 shadow-soft">
          <div className="flex items-center justify-between">
            <h1 className="text-xl font-bold text-gray-900">Post</h1>
            <button
              onClick={() => router.back()}
              className="rounded-xl border border-gray-200 bg-white px-3 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-50"
            >
              Back
            </button>
          </div>

          {loading ? (
            <p className="mt-6 text-sm text-gray-600">Loading...</p>
          ) : !post ? (
            <p className="mt-6 text-sm text-red-600">Post not found.</p>
          ) : (
            <div className="mt-5 rounded-2xl border border-gray-200 overflow-hidden">
              <div className="px-4 py-3">
                <p className="text-sm font-semibold text-gray-900">{post.author}</p>
                {post.caption ? (
                  <p className="text-sm text-gray-700 mt-1">{post.caption}</p>
                ) : null}
              </div>

              <div className="bg-black">
                {post.mediaType === "image" ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={post.mediaDataUrl}
                    alt="post"
                    className="w-full max-h-[420px] object-contain bg-white"
                  />
                ) : (
                  <video controls className="w-full max-h-[420px] bg-black">
                    <source src={post.mediaDataUrl} />
                  </video>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </main>
  );
}