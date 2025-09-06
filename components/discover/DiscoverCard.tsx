"use client";

import Link from "next/link";
import { ipfsToHttp } from "@/lib/ipfs/gateway";
import { useEffect, useState } from "react";
import { usePrivy, useWallets } from "@privy-io/react-auth";

type Item = { tokenId: number; name?: string; image?: string; city?: string; country?: string };

export default function DiscoverCard({ item }: { item: Item }) {
  const { authenticated, login } = usePrivy();
  const { wallets } = useWallets();
  const address = wallets[0]?.address?.toLowerCase();
  const [likes, setLikes] = useState(0);
  const [liked, setLiked] = useState(false);

  useEffect(() => {
    const load = async () => {
      try {
        const q = new URLSearchParams({ tokenId: String(item.tokenId), address: address || "" });
        const res = await fetch(`/api/likes?${q.toString()}`, { cache: "no-store" });
        const data = await res.json();
        setLikes(data.total || 0);
        setLiked(!!data.liked);
      } catch {}
    };
    void load();
  }, [item.tokenId, address]);

  const onToggleLike = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!authenticated || !address) {
      await login();
      return;
    }
    try {
      const res = await fetch(`/api/likes`, {
        method: "POST",
        headers: { "Content-Type": "application/json", "X-User-Address": address },
        body: JSON.stringify({ tokenId: item.tokenId }),
      });
      const data = await res.json();
      if (typeof data.liked === "boolean") {
        setLiked(data.liked);
        setLikes((prev) => prev + (data.liked ? 1 : -1));
      }
    } catch {}
  };

  return (
    <Link href={`/cat/${item.tokenId}`} className="rounded-lg border p-3 hover:bg-muted/40 transition block">
      <div className="relative aspect-square w-full overflow-hidden rounded mb-3 bg-muted">
        {item.image && (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={ipfsToHttp(item.image)} alt={item.name || "Cat"} className="w-full h-full object-cover" />
        )}
        <button
          onClick={onToggleLike}
          className={`absolute bottom-2 right-2 inline-flex items-center gap-1 rounded-md px-2 py-1 text-xs shadow ${
            liked ? "bg-white text-red-600" : "bg-white/90 text-gray-700"
          }`}
        >
          <span>❤</span>
          <span>{likes}</span>
        </button>
      </div>
      <div className="text-sm font-medium truncate">{item.name || `Cat #${item.tokenId}`}</div>
      {(item.city || item.country) && (
        <div className="text-xs text-muted-foreground truncate">{[item.city, item.country].filter(Boolean).join(", ")}</div>
      )}
    </Link>
  );
}


