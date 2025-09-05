"use client";

import { useConnectWallet, useLoginWithEmail, usePrivy, useWallets } from "@privy-io/react-auth";
import { Button } from "@/components/ui/button";
import { useState } from "react";

export default function AuthButtons() {
  const { ready, authenticated, user, logout } = usePrivy();
  const { connectWallet } = useConnectWallet();
  const { wallets } = useWallets();
  const { sendCode, loginWithCode } = useLoginWithEmail();
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  const [code, setCode] = useState("");

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
      <Button size="sm" onClick={connectWallet}>Connect Wallet</Button>
      <div className="flex items-center gap-1">
        {!sent ? (
          <>
            <input
              className="h-8 px-2 text-xs rounded border"
              type="email"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
            <Button
              size="sm"
              disabled={!email}
              onClick={async () => {
                await sendCode({ email });
                setSent(true);
              }}
            >
              Email Login
            </Button>
          </>
        ) : (
          <>
            <input
              className="h-8 px-2 text-xs rounded border"
              type="text"
              placeholder="Code"
              value={code}
              onChange={(e) => setCode(e.target.value)}
            />
            <Button
              size="sm"
              disabled={!code}
              onClick={() => loginWithCode({ email, code })}
            >
              Verify
            </Button>
          </>
        )}
      </div>
    </div>
  );
}


