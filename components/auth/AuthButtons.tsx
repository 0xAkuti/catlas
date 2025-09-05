"use client";

import { usePrivy, useWallets } from "@privy-io/react-auth";
import { Button } from "@/components/ui/button";

export default function AuthButtons() {
  const { ready, authenticated, user, logout, login } = usePrivy();
  const { wallets } = useWallets();

  if (!ready) return null;

  if (authenticated) {
    return (
      <div className="flex items-center gap-2">
        <span className="text-xs text-muted-foreground truncate max-w-[140px]">
          {user?.email?.address || wallets[0]?.address}
        </span>
        <Button variant="secondary" size="sm" onClick={logout}>Logout</Button>
      </div>
    );
  }

  return <Button size="sm" onClick={() => login()}>Sign in</Button>;
}


