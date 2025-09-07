"use client";

import { useEffect, useState } from "react";
import { usePrivy, useWallets } from "@privy-io/react-auth";
import { CatNftCard } from "@/components/nft/CatNftCard";
import MintDialog from "@/components/nft/MintDialog";
import { Button } from "@/components/ui/button";
import { Share2 } from "lucide-react";
import { getPublicClient } from "@/lib/web3/client";
import { worldCat1155Abi } from "@/lib/web3/abi/Catlas1155";

type Classification = {
  isCat: boolean;
  title?: string;
  breed?: string;
  color?: string;
  pattern?: string;
  bodyType?: string;
  eyeColor?: string;
  pose?: string;
  sceneDescription?: string;
};

export default function CatNftWithLikes({
  tokenId,
  classification,
  imageUrl,
  location,
  discovererName,
  discovererAddress,
}: {
  tokenId: number;
  classification: Classification;
  imageUrl?: string | null;
  location?: { city?: string; country?: string };
  discovererName?: string | null;
  discovererAddress?: string | null;
}) {
  const { authenticated, login } = usePrivy();
  const { wallets } = useWallets();
  const [likes, setLikes] = useState(0);
  const [liked, setLiked] = useState(false);
  const [supply, setSupply] = useState<number | undefined>(undefined);
  const [userBal, setUserBal] = useState<number | undefined>(undefined);

  const address = wallets[0]?.address as `0x${string}` | undefined;

  useEffect(() => {
    const load = async () => {
      try {
        const q = new URLSearchParams({ tokenId: String(tokenId), address: (address || "").toLowerCase() });
        const res = await fetch(`/api/likes?${q.toString()}`, { cache: "no-store" });
        const data = await res.json();
        setLikes(data.total || 0);
        setLiked(!!data.liked);
        // Fetch totalSupply
        const client = getPublicClient();
        const val = (await client.readContract({
          address: process.env.NEXT_PUBLIC_WORLDCAT1155_ADDRESS as `0x${string}`,
          abi: worldCat1155Abi,
          functionName: "totalSupply",
          args: [BigInt(tokenId)],
        })) as bigint;
        setSupply(Number(val));
        if (address) {
          const bal = (await client.readContract({
            address: process.env.NEXT_PUBLIC_WORLDCAT1155_ADDRESS as `0x${string}`,
            abi: worldCat1155Abi,
            functionName: "balanceOf",
            args: [address, BigInt(tokenId)],
          })) as bigint;
          setUserBal(Number(bal));
        }
      } catch {}
    };
    void load();
  }, [tokenId, address]);

  const onLike = async () => {
    if (!authenticated || !address) {
      await login();
      return;
    }
    try {
      const res = await fetch(`/api/likes`, {
        method: "POST",
        headers: { "Content-Type": "application/json", "X-User-Address": address },
        body: JSON.stringify({ tokenId }),
      });
      const data = await res.json();
      if (typeof data.liked === "boolean") {
        setLiked(data.liked);
        // Re-fetch total to avoid drift
        const q = new URLSearchParams({ tokenId: String(tokenId), address: (address || "").toLowerCase() });
        const res2 = await fetch(`/api/likes?${q.toString()}`, { cache: "no-store" });
        const d2 = await res2.json();
        setLikes(d2.total || 0);
      }
    } catch {}
  };

  return (
    <CatNftCard
      classification={classification}
      imageUrl={imageUrl || undefined}
      location={location}
      likesCount={likes}
      isLiked={liked}
      onLike={onLike}
      supplyCount={supply}
      userBalanceCount={userBal}
      discovererName={discovererName ?? undefined}
      discovererAddress={discovererAddress ?? undefined}
      actions={
        <>
          <MintDialog tokenId={tokenId} />
          <Button
            variant="secondary"
            onClick={async () => {
              const url = `${process.env.NEXT_PUBLIC_APP_URL || ""}/cat/${tokenId}`;
              const niceTitle = classification.title || "A Cat on Catlas";
              const where = location?.city || location?.country ? ` in ${[location?.city, location?.country].filter(Boolean).join(", ")}` : "";
              const text = `I discovered this purrfect cat${where} on Catlas: ${niceTitle} 🐾`;
              if (navigator.share) {
                try { await navigator.share({ title: niceTitle, text, url }); return; } catch {}
              }
              try { await navigator.clipboard.writeText(`${text} ${url}`); } catch {}
            }}
          >
            <Share2 className="w-4 h-4 mr-1" /> Share
          </Button>
        </>
      }
    />
  );
}


