import Link from "next/link";
import { Globe } from "@/components/magicui/Globe";
import { Card } from "@/components/ui/card";
import { getPublicClient } from "@/lib/web3/client";

async function getCharityBalance(): Promise<string | null> {
  try {
    const addr = process.env.NEXT_PUBLIC_CHARITY_ADDRESS as `0x${string}` | undefined;
    if (!addr) return null;
    const client = getPublicClient();
    const wei = await client.getBalance({ address: addr });
    const whole = Number(wei / 1000000000000000000n);
    const frac = Number(wei % 1000000000000000000n) / 1e18;
    return (whole + frac).toFixed(3) + " ETH";
  } catch {
    return null;
  }
}

export default async function Home() {
  const donation = await getCharityBalance();
  return (
    <section className="relative py-12 sm:py-16 lg:py-20">
      <div className="mx-auto max-w-3xl text-center">
        <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">WorldCat</h1>
        <p className="mt-4 text-base text-muted-foreground">
          Share cats found around the world. Record or upload a photo, we’ll detect if it’s a cat,
          and help you mint a unique, collectible NFT.
        </p>
        <div className="mt-6 flex items-center justify-center gap-3">
          <Link
            href="/upload"
            className="inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 disabled:opacity-50 disabled:pointer-events-none bg-primary text-primary-foreground shadow hover:bg-primary/90 h-10 px-6"
          >
            Get started
          </Link>
          <Link
            href="/discover"
            className="inline-flex items-center justify-center rounded-md border text-sm font-medium h-10 px-6"
          >
            Discover
          </Link>
        </div>
        {donation !== null && (
          <div className="mt-6 flex items-center justify-center">
            <Card className="px-4 py-2 text-sm">
              Total donations to charity: <span className="font-semibold">{donation}</span>
            </Card>
          </div>
        )}
      </div>
      <div className="mx-auto mt-12 max-w-5xl">
        <Globe />
      </div>
    </section>
  );
}
