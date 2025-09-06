"use client";

import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";

export function UserStats({ address }: { address: string }) {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<{ discovered: number; minted: number; earnedWei: string; likes: number } | null>(null);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const res = await fetch(`/api/users/${address}`);
        const data = await res.json();
        setStats(data?.stats || null);
      } catch {
        setStats(null);
      }
      setLoading(false);
    };
    void load();
  }, [address]);

  const formatEth = (weiStr: string | undefined) => {
    try {
      const wei = BigInt(weiStr || "0");
      const whole = Number(wei / 1000000000000000000n);
      const frac = Number(wei % 1000000000000000000n) / 1e18;
      return (whole + frac).toFixed(3) + " ETH";
    } catch {
      return "0.000 ETH";
    }
  };

  return (
    <Card className="p-4 col-span-full">
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div>
          <div className="text-xs text-muted-foreground">Discovered</div>
          <div className="text-lg font-semibold">{loading ? "-" : stats?.discovered ?? 0}</div>
        </div>
        <div>
          <div className="text-xs text-muted-foreground">Minted</div>
          <div className="text-lg font-semibold">{loading ? "-" : stats?.minted ?? 0}</div>
        </div>
        <div>
          <div className="text-xs text-muted-foreground">Earned</div>
          <div className="text-lg font-semibold">{loading ? "-" : formatEth(stats?.earnedWei)}</div>
        </div>
        <div>
          <div className="text-xs text-muted-foreground">Likes</div>
          <div className="text-lg font-semibold">{loading ? "-" : stats?.likes ?? 0}</div>
        </div>
      </div>
    </Card>
  );
}


