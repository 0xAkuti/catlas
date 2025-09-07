import Link from "next/link";
import Image from "next/image";
import { Globe } from "@/components/magicui/Globe";
import { Card } from "@/components/ui/card";
import { getPublicClient } from "@/lib/web3/client";
import { worldCat1155Abi } from "@/lib/web3/abi/Catlas1155";
import { catlasChain } from "@/lib/web3/client";
import { PawPrint, MapPin, Coins, HeartHandshake, Users } from "lucide-react";

async function getCharityInfo(): Promise<{ address: `0x${string}` | null; balanceEth: string | null }> {
  try {
    const client = getPublicClient();
    const contract = process.env.NEXT_PUBLIC_WORLDCAT1155_ADDRESS as `0x${string}` | undefined;
    if (!contract) return { address: null, balanceEth: null };
    const addr = (await client.readContract({
      address: contract,
      abi: worldCat1155Abi,
      functionName: "charity",
      args: [],
    })) as `0x${string}`;
    const wei = await client.getBalance({ address: addr });
    const whole = Number(wei / 1000000000000000000n);
    const frac = Number(wei % 1000000000000000000n) / 1e18;
    return { address: addr, balanceEth: (whole + frac).toFixed(3) + " ETH" };
  } catch {
    return { address: null, balanceEth: null };
  }
}

type CatLoc = { latitude?: number; longitude?: number };

async function fetchCatMarkers(): Promise<{ location: [number, number]; size: number }[]> {
  try {
    const res = await fetch(`${process.env.NEXT_PUBLIC_APP_URL || ""}/api/cats`, { cache: "no-store" });
    if (!res.ok) return [];
    const data = await res.json();
    const items: CatLoc[] = data?.items || [];
    return items
      .filter((i) => typeof i.latitude === "number" && typeof i.longitude === "number")
      .map((i) => ({ location: [i.latitude as number, i.longitude as number] as [number, number], size: 0.06 }));
  } catch {
    return [];
  }
}

export default async function Home() {
  const [charity, markers] = await Promise.all([getCharityInfo(), fetchCatMarkers()]);
  return (
    <section className="relative py-12 sm:py-16 lg:py-20">
      <div className="mx-auto max-w-3xl text-center">
        <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">Catlas</h1>
        <p className="mt-4 text-base text-muted-foreground">
        Catlas is a playful social app that helps you explore your neighborhood and the world. Snap a street cat, pin it on the map, and share the joy with cat lovers everywhere.
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
        <div className="mt-6 flex items-center justify-center">
          <div className="rounded-xl border px-4 py-3 inline-flex">
            <div className="flex items-center gap-3">
              <Image src="/charity.png" alt="Charity" width={64} height={64} className="rounded-md" />
              <div className="min-w-0">
                <div className="text-xs uppercase tracking-wide text-muted-foreground">Donations to charity</div>
                <div className="mt-1 text-2xl font-semibold leading-none">{charity.balanceEth ?? "-"}</div>
                {charity.address && (
                  <div className="mt-1 text-xs truncate">
                    <a
                      href={`${catlasChain?.blockExplorers?.default?.url || ""}address/${charity.address}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="underline text-muted-foreground hover:text-foreground"
                    >
                      View address
                    </a>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
      <div className="mx-auto mt-4 sm:mt-4 max-w-5xl">
        <Globe config={{ markers }} />
      </div>

      <div className="mx-auto mt-4 max-w-4xl">
        <div className="grid gap-2 sm:gap-4 sm:grid-cols-3">
          <div className="p-3 sm:p-4 sm:rounded-xl sm:border">
            <div className="flex items-center gap-2 mb-1">
              <PawPrint size={24} className="text-muted-foreground" />
              <h3 className="text-sm font-semibold">Snap & analyze</h3>
            </div>
            <p className="text-sm text-muted-foreground">Upload and crop a photo. AI helps describe the cat and scene.</p>
          </div>
          <div className="p-3 sm:p-4 sm:rounded-xl sm:border">
            <div className="flex items-center gap-2 mb-1">
              <PawPrint size={24} className="text-muted-foreground" />
              <h3 className="text-sm font-semibold">Mint & share</h3>
            </div>
            <p className="text-sm text-muted-foreground">Publish as an ERC‑1155 NFT and share your discovery.</p>
          </div>
          <div className="p-3 sm:p-4 sm:rounded-xl sm:border">
            <div className="flex items-center gap-2 mb-1">
              <PawPrint size={24} className="text-muted-foreground" />
              <h3 className="text-sm font-semibold">Support charity</h3>
            </div>
            <p className="text-sm text-muted-foreground">Every mint splits earnings equally between discoverer, Catlas, <a href="https://pawthereum.com" target="_blank" rel="noopener noreferrer" className="underline">animal welfare charity</a>.</p>
          </div>
        </div>
      </div>
      <div className="mt-12 relative left-1/2 right-1/2 w-screen -ml-[50vw] -mr-[50vw]">
        <div
          className="h-[220px] sm:h-[280px] md:h-[360px] lg:h-[420px] w-screen marquee-bg"
          style={{ backgroundImage: 'url(/section-banner.png)' }}
        />
      </div>
      <div className="mx-auto mt-10 max-w-4xl">
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="flex items-start gap-3">
            <div className="rounded-md bg-primary/10 p-2 text-primary"><MapPin className="h-5 w-5" /></div>
            <p className="text-sm"><span className="font-medium">Real‑Time World Map</span> – Every street cat pinned where it’s found.</p>
          </div>
          <div className="flex items-start gap-3">
            <div className="rounded-md bg-primary/10 p-2 text-primary"><Coins className="h-5 w-5" /></div>
            <p className="text-sm"><span className="font-medium">Earn While You Explore</span>: Discoverers earn when others mint their photos as NFTs.</p>
          </div>
          <div className="flex items-start gap-3">
            <div className="rounded-md bg-primary/10 p-2 text-primary"><HeartHandshake className="h-5 w-5" /></div>
            <p className="text-sm"><span className="font-medium">Mintable Memories</span> – Collect and support animal rescues with each NFT.</p>
          </div>
          <div className="flex items-start gap-3">
            <div className="rounded-md bg-primary/10 p-2 text-primary"><Users className="h-5 w-5" /></div>
            <p className="text-sm"><span className="font-medium">Global Cat Community</span> – Meet new friends and discover cats together.</p>
          </div>
        </div>
      </div>

      <div className="mx-auto mt-12 max-w-3xl text-center">
        <Card className="p-4 sm:p-6">
        <h3 className="text-lg font-semibold">Turn moments into impact</h3>
        <p className="mt-4 text-center text-sm text-muted-foreground">
          Every discovery can become a collectible. Minting splits proceeds equally between the discoverer,
          Catlas, and <a href="https://pawthereum.com" target="_blank" rel="noopener noreferrer" className="underline">animal welfare charity</a>, supporting real cats with every mint.
        </p>
          <div className="mt-3 flex items-center justify-center gap-3">
            <Link
              href="/upload"
              className="inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 disabled:opacity-50 disabled:pointer-events-none bg-primary text-primary-foreground shadow hover:bg-primary/90 h-9 px-4"
            >
              Upload now
            </Link>
            <Link
              href="/discover"
              className="inline-flex items-center justify-center rounded-md border text-sm font-medium h-9 px-4"
            >
              Discover
            </Link>
          </div>
        </Card>
      </div>
    </section>
  );
}
