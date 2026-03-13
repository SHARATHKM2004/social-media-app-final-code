"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import PasswordField from "@/components/PasswordField";
import Link from "next/link";
import useBackToLanding from "@/components/useBackToLanding";

export default function LoginPage() {
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  useBackToLanding();

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    if (!username || !password) {
      setError("Username and password are required.");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data?.error || "Login failed.");
        setLoading(false);
        return;
      }
      localStorage.setItem("currentUser", username);
      router.push(`/login/success?username=${encodeURIComponent(username)}`);
    
    } catch {
      setError("Something went wrong.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen bg-neutral-50">
      <div className="mx-auto flex min-h-screen max-w-md flex-col justify-center px-5">
        <div className="rounded-3xl bg-white p-6 shadow-soft">
          <h1 className="text-xl font-bold text-gray-900">Login</h1>
          <p className="mt-1 text-sm text-gray-600">Welcome back 👋</p>

          <form onSubmit={handleLogin} className="mt-6 space-y-3">
            <input
              placeholder="Username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm outline-none focus:border-brand-blue focus:ring-2 focus:ring-brand-blue/20"
            />

            <PasswordField
              name="password"
              placeholder="Password"
              value={password}
              onChange={setPassword}
            />

            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-xl bg-brand-blue px-4 py-3 text-sm font-semibold text-white hover:opacity-95 disabled:opacity-60"
            >
              {loading ? "Logging in..." : "Login"}
            </button>

            {error ? <p className="text-sm text-red-600">{error}</p> : null}
          </form>

          <p className="mt-6 text-center text-sm text-gray-600">
            New here?{" "}
            <Link href="/register" className="font-semibold text-brand-blue">
              Create an account
            </Link>
          </p>
        </div>
      </div>
    </main>
  );
}