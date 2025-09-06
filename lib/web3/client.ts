import { createPublicClient, http } from "viem";
import { base, anvil } from "viem/chains";

export const worldcatChain = ((): any => {
  const id = Number(process.env.NEXT_PUBLIC_CHAIN_ID || 8453);
  if (id === 31337) return anvil;
  return base;
})();

export function getPublicClient() {
  const rpc = process.env.NEXT_PUBLIC_RPC_URL || (worldcatChain.id === 31337 ? "http://127.0.0.1:8545" : "https://mainnet.base.org");
  return createPublicClient({ chain: worldcatChain, transport: http(rpc) });
}

// Wallet client will be created via EIP-1193 provider from Privy when needed

