"use client";

import { catlasChain } from "@/lib/web3/client";
import { PrivyProvider } from "@privy-io/react-auth";

export default function Providers({
  children,
}: {
  children: React.ReactNode;
}) {
  const appId = process.env.NEXT_PUBLIC_PRIVY_APP_ID as string | undefined;
  return (
    <PrivyProvider
      appId={appId || ""}
      config={{
        defaultChain: catlasChain,
        // Enable embedded wallets for users without wallets on login
        embeddedWallets: {
          ethereum: { createOnLogin: "users-without-wallets" },
        },
      }}
    >
      {children}
    </PrivyProvider>
  );
}


