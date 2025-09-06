import { createPublicClient, http, type Chain } from "viem";
import { base, anvil } from "viem/chains";
import { riseTestnet } from 'rise-wallet';

export const catlasChain: Chain = ((): Chain => {
  const id = process.env.NEXT_PUBLIC_CHAIN_NAME || 'anvil';
  if (id === 'riseTestnet') return riseTestnet;
  if (id === 'anvil') return anvil;
  if (id === 'base') return base;
  return base;
})();

export function getPublicClient() {
  const rpc = catlasChain.rpcUrls?.default?.http?.[0];
  return createPublicClient({ chain: catlasChain, transport: http(rpc) });
}

// Wallet client will be created via EIP-1193 provider from Privy when needed

