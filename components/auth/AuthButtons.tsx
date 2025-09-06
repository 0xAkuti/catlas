"use client";

import Link from "next/link";
import { usePrivy, useWallets } from "@privy-io/react-auth";
import { Button } from "@/components/ui/button";

export default function AuthButtons() {
  const { ready, authenticated, /* user, */ logout, login } = usePrivy();
  const { wallets } = useWallets();

  if (!ready) return null;

  if (authenticated) {
    return (
      <div className="flex items-center gap-2">
        {wallets[0]?.address && (
          <Link href={`/u/${wallets[0].address}`} className="text-sm underline">
            My profile
          </Link>
        )}
        <Button variant="secondary" size="sm" onClick={logout}>Logout</Button>
      </div>
    );
  }

  return <Button size="sm" onClick={() => login()}>Sign in</Button>;
}


