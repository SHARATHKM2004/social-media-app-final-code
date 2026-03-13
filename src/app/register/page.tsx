"use client";

import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import Link from "next/link";
import PasswordField from "@/components/PasswordField";
import useBackToLanding from "@/components/useBackToLanding";

export default function RegisterPage() {
  const router = useRouter();
  useBackToLanding(); // ✅ back always to landing (except home)

  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const passwordRuleText =
    "Password must be 8+ chars and include uppercase, lowercase, number & symbol.";

  const isStrongPassword = useMemo(() => {
    const regex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9]).{8,}$/;
    return regex.test(password);
  }, [password]);

  async function handleRegister(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    if (!username || !email || !password || !confirmPassword) {
      setError("All fields are required.");
      return;
    }

    if (!isStrongPassword) {
      setError(passwordRuleText);
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, email, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data?.error || "Registration failed.");
        setLoading(false);
        return;
      }

      router.push(`/register/success?username=${encodeURIComponent(username)}`);
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
          <h1 className="text-xl font-bold text-gray-900">Register</h1>
          <p className="mt-1 text-sm text-gray-600">Create your account 🚀</p>

          <form onSubmit={handleRegister} className="mt-6 space-y-3">
            <input
              placeholder="Username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm outline-none focus:border-brand-blue focus:ring-2 focus:ring-brand-blue/20"
            />

            <input
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm outline-none focus:border-brand-blue focus:ring-2 focus:ring-brand-blue/20"
            />

            <PasswordField
              name="password"
              placeholder="Choose Password"
              value={password}
              onChange={setPassword}
            />

            <PasswordField
              name="confirmPassword"
              placeholder="Confirm Password"
              value={confirmPassword}
              onChange={setConfirmPassword}
            />

            <p className={`text-xs ${isStrongPassword ? "text-green-600" : "text-gray-600"}`}>
              {passwordRuleText}
            </p>

            <div className="grid grid-cols-2 gap-3 pt-1">
              <button
                type="submit"
                disabled={loading}
                className="w-full rounded-xl bg-brand-blue px-4 py-3 text-sm font-semibold text-white hover:opacity-95 disabled:opacity-60"
              >
                {loading ? "Registering..." : "Register"}
              </button>

              <Link
                href="/login"
                className="w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-center text-sm font-semibold text-gray-700 hover:bg-gray-50"
              >
                Go to Login
              </Link>
            </div>

            {error ? <p className="text-sm text-red-600">{error}</p> : null}
          </form>
        </div>
      </div>
    </main>
  );
}
