import Link from "next/link";

// ✅ SSG (Static Site Generation)
// This page is fully static (no cookies/headers/no-store fetch).
// Next.js will pre-render it at build time and serve from CDN.
export default function LandingPage() {
  return (
    <main className="min-h-screen bg-neutral-50 p-6">
      <div className="mx-auto max-w-md rounded-3xl border border-gray-200 bg-white p-6 shadow-soft">
        <h1 className="text-xl font-bold text-gray-900">Lets Connect</h1>
        <p className="mt-1 text-sm text-gray-600">Connect • Share • Explore</p>

        <p className="mt-4 text-sm text-gray-700">
          A simple social-media style app with register & login flow.
        </p>

        <div className="mt-5 flex gap-3">
          <Link
            href="/register"
            className="rounded-xl bg-brand-blue px-4 py-2 text-sm font-semibold text-white"
          >
            Join Us
          </Link>
          <Link
            href="/login"
            className="rounded-xl border border-gray-200 bg-white px-4 py-2 text-sm font-semibold text-gray-800"
          >
            Login
          </Link>
        </div>

        <p className="mt-5 text-xs text-gray-500">
          Tip: Use a strong password (8+ chars, uppercase, lowercase, number & symbol).
        </p>
      </div>
    </main>
  );
}
