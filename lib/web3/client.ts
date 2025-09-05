import { createPublicClient, createWalletClient, http } from "viem";
import { base } from "viem/chains";

export const worldcatChain = base;

export function getPublicClient() {
  const rpc = process.env.NEXT_PUBLIC_RPC_URL || "https://mainnet.base.org";
  return createPublicClient({ chain: worldcatChain, transport: http(rpc) });
}

// Wallet client will be created via EIP-1193 provider from Privy when needed

