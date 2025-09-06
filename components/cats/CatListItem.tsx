"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { ipfsToHttp } from "@/lib/ipfs/gateway";
import { usePrivy, useWallets } from "@privy-io/react-auth";
import { Heart, Layers } from "lucide-react";
import { getPublicClient } from "@/lib/web3/client";
import { worldCat1155Abi } from "@/lib/web3/abi/WorldCat1155";

type Item = { tokenId: number; name?: string; image?: string; city?: string; country?: string };

export function CatListItem({ item }: { item: Item }) {
  const { authenticated, login } = usePrivy();
  const { wallets } = useWallets();
  const address = wallets[0]?.address as `0x${string}` | undefined;

  const [likes, setLikes] = useState(0);
  const [liked, setLiked] = useState(false);
  const [supply, setSupply] = useState<number | undefined>(undefined);

  useEffect(() => {
    const load = async () => {
      try {
        const q = new URLSearchParams({ tokenId: String(item.tokenId), address: (address || "").toLowerCase() });
        const res = await fetch(`/api/likes?${q.toString()}`, { cache: "no-store" });
        const data = await res.json();
        setLikes(data.total || 0);
        setLiked(!!data.liked);
      } catch {}
    };
    void load();
  }, [item.tokenId, address]);

  useEffect(() => {
    const loadSupply = async () => {
      try {
        const client = getPublicClient();
        const contractAddress = process.env.NEXT_PUBLIC_WORLDCAT1155_ADDRESS as `0x${string}`;
        if (!contractAddress) return;
        const val = (await client.readContract({
          address: contractAddress,
          abi: worldCat1155Abi,
          functionName: "totalSupply",
          args: [BigInt(item.tokenId)],
        })) as bigint;
        setSupply(Number(val));
      } catch {}
    };
    void loadSupply();
  }, [item.tokenId]);

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
        // Re-fetch to avoid drift
        const q = new URLSearchParams({ tokenId: String(item.tokenId), address: (address || "").toLowerCase() });
        const res2 = await fetch(`/api/likes?${q.toString()}`, { cache: "no-store" });
        const d2 = await res2.json();
        setLikes(d2.total || 0);
      }
    } catch {}
  };

  return (
    <Link href={`/cat/${item.tokenId}`} className="rounded-lg border p-3 hover:bg-muted/40 transition flex items-center gap-3">
      <div className="relative w-16 h-16 shrink-0 overflow-hidden rounded bg-muted">
        {item.image && (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={ipfsToHttp(item.image)} alt={item.name || "Cat"} className="w-full h-full object-cover" />
        )}
      </div>
      <div className="min-w-0 flex-1">
        <div className="text-sm font-medium truncate">{item.name || `Cat #${item.tokenId}`}</div>
        {(item.city || item.country) && (
          <div className="text-xs text-muted-foreground truncate">{[item.city, item.country].filter(Boolean).join(", ")}</div>
        )}
      </div>
      <div className="flex items-center gap-2">
        {typeof supply === "number" && (
          <Button variant="secondary" size="sm" className="shadow bg-white text-gray-700">
            <Layers className="w-4 h-4 mr-1 text-gray-600" />
            {supply}
          </Button>
        )}
        <Button
          onClick={onToggleLike}
          variant={liked ? "default" : "secondary"}
          size="sm"
          className={`shadow backdrop-blur-sm ${liked ? "bg-white text-gray-900" : "bg-white text-gray-700"}`}
        >
          <Heart className={`w-4 h-4 mr-1 ${liked ? "fill-current text-red-500" : "text-gray-600"}`} />
          {likes}
        </Button>
      </div>
    </Link>
  );
}


