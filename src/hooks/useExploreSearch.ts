"use client";

import { useEffect, useState } from "react";
import { SearchUser } from "@/types/user";

export function useExploreSearch(enabled: boolean) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchUser[]>([]);
  const [searchLoading, setSearchLoading] = useState(false);

  useEffect(() => {
    if (!enabled) return;

    const t = setTimeout(async () => {
      const q = query.trim();
      if (!q) {
        setResults([]);
        return;
      }

      setSearchLoading(true);
      try {
        const res = await fetch(`/api/users/search?q=${encodeURIComponent(q)}`);
        const data = await res.json();
        if (res.ok) setResults(data.users || []);
        else setResults([]);
      } finally {
        setSearchLoading(false);
      }
    }, 300);

    return () => clearTimeout(t);
  }, [query, enabled]);

  return { query, setQuery, results, searchLoading };
}
