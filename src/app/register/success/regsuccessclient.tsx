"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import useBackToLanding from "@/components/useBackToLanding";

export default function regsuccessclient() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const username = searchParams.get("username") || "User";
  const [count, setCount] = useState(5);

  useBackToLanding();

  useEffect(() => {
    const interval = setInterval(() => {
      setCount((c) => (c > 0 ? c - 1 : 0));
    }, 1000);

    const timeout = setTimeout(() => {
      router.replace("/login");
    }, 5000);

    return () => {
      clearInterval(interval);
      clearTimeout(timeout);
    };
  }, [router]);

  return (
    <main className="min-h-screen bg-neutral-50">
      <div className="mx-auto flex min-h-screen max-w-md flex-col justify-center px-5">
        <div className="rounded-3xl bg-white p-6 shadow-soft">
          <h1 className="text-xl font-bold text-gray-900">Registration Successful </h1>

          <p className="mt-2 text-sm text-gray-700">
            You are registered as <span className="font-semibold">{username}</span>.
          </p>

          <p className="mt-1 text-sm text-gray-600">Please login to continue.</p>

          <div className="mt-6 rounded-2xl bg-neutral-50 p-4">
            <p className="text-sm text-gray-700">
              Redirecting to login in <span className="font-semibold">{count}</span> seconds...
            </p>
          </div>

          <button
            onClick={() => router.replace("/login")}
            className="mt-4 w-full rounded-xl bg-brand-blue px-4 py-3 text-sm font-semibold text-white hover:opacity-95"
          >
            Continue
          </button>
        </div>
      </div>
    </main>
  );
}