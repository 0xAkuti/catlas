"use client";

import { useEffect, useState } from "react";
import { usePrivy, useWallets } from "@privy-io/react-auth";
import { CatNftCard } from "@/components/nft/CatNftCard";

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
}: {
  tokenId: number;
  classification: Classification;
  imageUrl?: string | null;
  location?: { city?: string; country?: string };
}) {
  const { authenticated, login } = usePrivy();
  const { wallets } = useWallets();
  const [likes, setLikes] = useState(0);
  const [liked, setLiked] = useState(false);

  const address = wallets[0]?.address?.toLowerCase();

  useEffect(() => {
    const load = async () => {
      try {
        const q = new URLSearchParams({ tokenId: String(tokenId), address: address || "" });
        const res = await fetch(`/api/likes?${q.toString()}`, { cache: "no-store" });
        const data = await res.json();
        setLikes(data.total || 0);
        setLiked(!!data.liked);
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
        setLikes((prev) => prev + (data.liked ? 1 : -1));
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
    />
  );
}


