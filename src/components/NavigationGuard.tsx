"use client";

import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";

export default function BackNavigationGuard() {
  const pathname = usePathname();
  const router = useRouter();
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);

  useEffect(() => {
    // Home page special behavior
    if (pathname === "/home") {
      // Add a dummy history entry so browser back triggers popstate without leaving immediately
      window.history.pushState(null, "", window.location.href);

      const onPopState = () => {
        // keep user on home by pushing state again
        window.history.pushState(null, "", window.location.href);
        setShowLogoutConfirm(true);
      };

      window.addEventListener("popstate", onPopState);
      return () => window.removeEventListener("popstate", onPopState);
    }

    // Everywhere else: back => landing page
    const onPopState = () => {
      router.replace("/");
    };

    window.addEventListener("popstate", onPopState);
    return () => window.removeEventListener("popstate", onPopState);
  }, [pathname, router]);

  if (pathname !== "/home") return null;

  return (
    <>
      {showLogoutConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-sm rounded-2xl bg-white p-5 shadow-soft">
            <h2 className="text-lg font-semibold text-gray-900">Logout?</h2>
            <p className="mt-2 text-sm text-gray-600">
              Are you sure you want to logout?
            </p>

            <div className="mt-5 flex gap-3">
              <button
                className="flex-1 rounded-xl border border-gray-200 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
                onClick={() => setShowLogoutConfirm(false)}
              >
                Cancel
              </button>

              <button
                className="flex-1 rounded-xl bg-brand-blue px-4 py-2 text-sm font-semibold text-white hover:opacity-95"
                onClick={() => {
                  setShowLogoutConfirm(false);
                  router.replace("/");
                }}
              >
                OK
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}