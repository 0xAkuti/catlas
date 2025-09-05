"use client";

import { useConnectWallet, usePrivy, useWallets } from "@privy-io/react-auth";
import { Button } from "@/components/ui/button";

export default function AuthButtons() {
  const { ready, authenticated, user, logout, login } = usePrivy();
  const { connectWallet } = useConnectWallet();
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

  return (
    <div className="flex items-center gap-2">
      <Button size="sm" onClick={() => login()}>Sign in</Button>
      <Button size="sm" variant="secondary" onClick={connectWallet}>Connect wallet</Button>
    </div>
  );
}


