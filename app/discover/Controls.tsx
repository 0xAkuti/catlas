"use client";

import { useEffect, useMemo, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export default function DiscoverControls({ q, sort }: { q: string; sort: string }) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [query, setQuery] = useState(q);
  const [sel, setSel] = useState(sort || "newest");

  // Debounce query changes
  useEffect(() => {
    const t = setTimeout(() => {
      const params = new URLSearchParams(searchParams.toString());
      if (query) params.set("q", query); else params.delete("q");
      params.set("sort", sel);
      router.push(`${pathname}?${params.toString()}`);
    }, 300);
    return () => clearTimeout(t);
  }, [query]);

  const onSortChange = (value: string) => {
    setSel(value);
    const params = new URLSearchParams(searchParams.toString());
    if (query) params.set("q", query); else params.delete("q");
    params.set("sort", value);
    router.push(`${pathname}?${params.toString()}`);
  };

  return (
    <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex-1">
        <Input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search name, city, color, breed..."
        />
      </div>
      <div className="relative z-40">
        <Select value={sel} onValueChange={onSortChange}>
          <SelectTrigger className="w-[180px]"><SelectValue placeholder="Sort" /></SelectTrigger>
          <SelectContent className="z-[10000]">
            <SelectItem value="newest">Newest</SelectItem>
            <SelectItem value="oldest">Oldest</SelectItem>
            <SelectItem value="most_liked">Most liked</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>
  );
}


