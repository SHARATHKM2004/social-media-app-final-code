import Link from "next/link";

export default function LandingPage() {
  return (
    <main className="min-h-screen bg-neutral-50">
      <div className="mx-auto flex min-h-screen max-w-md flex-col justify-center px-5">
        <div className="rounded-3xl bg-white p-6 shadow-soft">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-2xl bg-brand-blue" />
            <div>
              <h1 className="text-xl font-bold text-gray-900">Lets Connect</h1>
              <p className="text-xs text-brand-gray">Connect • Share • Explore</p>
            </div>
          </div>

          <p className="mt-4 text-sm text-gray-600">
            A simple social-media style app with register & login flow.
          </p>

          <div className="mt-6 grid grid-cols-2 gap-3">
            <Link
              href="/register"
              className="rounded-xl bg-brand-blue px-4 py-3 text-center text-sm font-semibold text-white hover:opacity-95"
            >
              Join Us
            </Link>
            <Link
              href="/login"
              className="rounded-xl border border-gray-200 bg-white px-4 py-3 text-center text-sm font-semibold text-gray-800 hover:bg-gray-50"
            >
              Login
            </Link>
          </div>

          <div className="mt-6 rounded-2xl bg-neutral-50 p-4">
            <p className="text-xs text-gray-600">
              Tip: Use a strong password (8+ chars, uppercase, lowercase, number & symbol).
            </p>
          </div>
        </div>

        <p className="mt-6 text-center text-xs text-gray-500">
      
        </p>
      </div>
    </main>
  );
}