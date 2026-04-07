import Link from "next/link";

export default function LandingPage() {
  return (
    <main className="min-h-screen flex items-center justify-center bg-neutral-50 px-4">
      <div className="w-full max-w-sm rounded-2xl border border-gray-200 bg-white px-6 py-8 shadow-sm">
        {/* App Title */}
        <div className="mb-6 text-center">
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight">
            Let’s Connect
          </h1>
          <p className="mt-1 text-sm text-gray-500">
            Connect • Share • Explore
          </p>
        </div>

        {/* Description */}
        <p className="mb-6 text-center text-sm text-gray-600">
          A simple social app to share moments and stay connected with your team.
        </p>

        {/* Actions */}
        <div className="flex flex-col gap-3">
          <Link
            href="/register"
            className="rounded-xl bg-brand-blue py-2.5 text-center text-sm font-semibold text-white hover:opacity-95"
          >
            Join Now
          </Link>

          <Link
            href="/login"
            className="rounded-xl border border-gray-300 py-2.5 text-center text-sm font-semibold text-gray-800 hover:bg-gray-50"
          >
            Log In
          </Link>
        </div>

        {/* Footer */}
        <p className="mt-6 text-center text-xs text-gray-400">
          Built for real-time collaboration.
        </p>
      </div>
    </main>
  );
}