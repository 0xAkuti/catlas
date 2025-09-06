"use client";

import Link from "next/link";
import { ipfsToHttp } from "@/lib/ipfs/gateway";
import { useEffect, useState } from "react";
import { usePrivy, useWallets } from "@privy-io/react-auth";
import { Button } from "@/components/ui/button";
import { Heart } from "lucide-react";

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
        <div className="absolute bottom-3 right-3 flex gap-2">
          <Button
            onClick={onToggleLike}
            variant={liked ? "default" : "secondary"}
            size="sm"
            className={`shadow-lg backdrop-blur-sm ${
              liked
                ? "bg-white/90 hover:bg-white text-gray-900"
                : "bg-white/90 hover:bg-white text-gray-700 hover:text-gray-900"
            }`}
          >
            <Heart className={`w-4 h-4 mr-1 ${liked ? "fill-current text-red-500" : "text-gray-600"}`} />
            {likes}
          </Button>
        </div>
      </div>
      <div className="text-sm font-medium truncate">{item.name || `Cat #${item.tokenId}`}</div>
      {(item.city || item.country) && (
        <div className="text-xs text-muted-foreground truncate">{[item.city, item.country].filter(Boolean).join(", ")}</div>
      )}
    </Link>
  );
}


