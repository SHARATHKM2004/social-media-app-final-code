"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";

export default function RegisterSuccessPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const username = searchParams.get("username") || "User";

  const [count, setCount] = useState(5);

  useEffect(() => {
    localStorage.setItem("currentUser", username);
``
    const interval = setInterval(() => {
      setCount((c) => (c > 0 ? c - 1 : 0));
    }, 1000);

    const timeout = setTimeout(() => {
      router.push("/login");
    }, 5000);

    return () => {
      clearInterval(interval);
      clearTimeout(timeout);
    };
  }, [router]);

  return (
    <main style={{ padding: 24, fontFamily: "sans-serif" }}>
      <h1>Registration Successful ✅</h1>
      <p>
        You are registered as <b>{username}</b>. Please login.
      </p>
      <p>
        Redirecting to login page in <b>{count}</b> seconds...
      </p>

      <button
        onClick={() => router.push("/login")}
        style={{ padding: "10px 16px", cursor: "pointer", marginTop: 10 }}
      >
        Continue
      </button>
    </main>
  );
}