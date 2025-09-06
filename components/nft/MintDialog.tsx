"use client";

import { useEffect, useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { worldCat1155Abi } from "@/lib/web3/abi/WorldCat1155";
import { getPublicClient } from "@/lib/web3/client";
import { usePrivy, useWallets } from "@privy-io/react-auth";
import { createWalletClient, custom } from "viem";
import { worldcatChain } from "@/lib/web3/client";
import { toast } from "sonner";

export default function MintDialog({ tokenId }: { tokenId: number }) {
  const [open, setOpen] = useState(false);
  const [mintPrice, setMintPrice] = useState<bigint | null>(null);
  const [amount, setAmount] = useState(1);
  const { authenticated } = usePrivy();
  const { wallets } = useWallets();

  useEffect(() => {
    const load = async () => {
      const client = getPublicClient();
      const price = await client.readContract({
        address: process.env.NEXT_PUBLIC_WORLDCAT1155_ADDRESS as `0x${string}`,
        abi: worldCat1155Abi,
        functionName: "mintPrice",
        args: [],
      });
      setMintPrice(price as bigint);
    };
    if (open) void load();
  }, [open]);

  const total = mintPrice ? mintPrice * BigInt(amount) : 0n;

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>Mint</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Mint this cat</DialogTitle>
        </DialogHeader>
        <div className="space-y-3">
          <div className="text-sm text-muted-foreground">
            Price per mint: {mintPrice ? `${Number(mintPrice) / 1e18} ETH` : "-"}
          </div>
          <div className="flex items-center gap-2">
            <label className="text-sm">Amount</label>
            <Input
              type="number"
              min={1}
              value={amount}
              onChange={(e) => setAmount(Math.max(1, Number(e.target.value)))}
              className="w-24"
            />
          </div>
          <div className="text-sm">Total: {mintPrice ? `${Number(total) / 1e18} ETH` : "-"}</div>
          <Button
            disabled={!authenticated || !wallets[0] || !mintPrice}
            onClick={async () => {
              if (!authenticated || !wallets[0] || !mintPrice) return;
              const provider = await wallets[0].getEthereumProvider?.();
              if (!provider) return;
              const walletClient = createWalletClient({ chain: worldcatChain, transport: custom(provider) });
              const hash = await walletClient.writeContract({
                chain: worldcatChain,
                account: wallets[0].address as `0x${string}`,
                address: process.env.NEXT_PUBLIC_WORLDCAT1155_ADDRESS as `0x${string}`,
                abi: worldCat1155Abi,
                functionName: "mint",
                args: [BigInt(tokenId), BigInt(amount)],
                value: total,
              });
              const explorerBase = worldcatChain?.blockExplorers?.default?.url;
              const txUrl = explorerBase ? `${explorerBase}/tx/${hash}` : undefined;
              toast.success("Mint successful!", {
                description: `You minted ${amount} token${amount > 1 ? "s" : ""}`,
                action: txUrl ? {
                  label: "View Tx",
                  onClick: () => {
                    window.open(txUrl, "_blank");
                  }
                } : undefined,
              });
              setOpen(false);
            }}
          >
            Confirm mint
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}


