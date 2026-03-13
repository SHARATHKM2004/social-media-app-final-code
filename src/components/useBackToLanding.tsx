"use client";

import { useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";

export default function useBackToLanding() {
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    // skip home because home has its own confirm popup behavior
    if (pathname === "/home") return;

    // push a state so back triggers popstate while staying controllable
    window.history.pushState(null, "", window.location.href);

    const onPopState = () => {
      router.replace("/");
    };

    window.addEventListener("popstate", onPopState);
    return () => window.removeEventListener("popstate", onPopState);
  }, [pathname, router]);
}