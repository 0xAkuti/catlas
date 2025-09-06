import Link from "next/link";
import Image from "next/image";
import { Globe } from "@/components/magicui/Globe";
import { Card } from "@/components/ui/card";
import { getPublicClient } from "@/lib/web3/client";
import { worldCat1155Abi } from "@/lib/web3/abi/Catlas1155";

async function getCharityBalance(): Promise<string | null> {
  try {
    const client = getPublicClient();
    const contract = process.env.NEXT_PUBLIC_WORLDCAT1155_ADDRESS as `0x${string}` | undefined;
    if (!contract) return null;
    const addr = (await client.readContract({
      address: contract,
      abi: worldCat1155Abi,
      functionName: "charity",
      args: [],
    })) as `0x${string}`;
    const wei = await client.getBalance({ address: addr });
    const whole = Number(wei / 1000000000000000000n);
    const frac = Number(wei % 1000000000000000000n) / 1e18;
    return (whole + frac).toFixed(3) + " ETH";
  } catch {
    return null;
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
  const [donation, markers] = await Promise.all([getCharityBalance(), fetchCatMarkers()]);
  return (
    <section className="relative py-12 sm:py-16 lg:py-20">
      <div className="mx-auto max-w-3xl text-center">
        <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">Catlas</h1>
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
        <div className="mt-6 flex items-center justify-center">
          <Card className="px-4 py-2 text-sm">
            Total donations to charity: <span className="font-semibold">{donation ?? "-"}</span>
          </Card>
        </div>
      </div>
      <div className="mx-auto mt-12 max-w-5xl">
        <Globe config={{ markers }} />
        <p className="mt-4 text-center text-sm text-muted-foreground">
          Every discovery can become a collectible. Minting splits proceeds equally between the discoverer,
          Catlas, and our charity partner—supporting real cats with every mint.
        </p>
      </div>

      <div className="mx-auto mt-12 max-w-4xl">
        <div className="grid gap-4 sm:grid-cols-3">
          <Card className="p-4">
            <h3 className="text-sm font-semibold mb-1">1. Snap & analyze</h3>
            <p className="text-sm text-muted-foreground">Upload and crop a photo. AI helps describe the cat and scene.</p>
          </Card>
          <Card className="p-4">
            <h3 className="text-sm font-semibold mb-1">2. Mint & share</h3>
            <p className="text-sm text-muted-foreground">Publish as an ERC‑1155 NFT and share your discovery.</p>
          </Card>
          <Card className="p-4">
            <h3 className="text-sm font-semibold mb-1">3. Support charity</h3>
            <p className="text-sm text-muted-foreground">Every mint splits earnings equally—discoverer, Catlas, charity.</p>
          </Card>
        </div>
      </div>

      <div className="mx-auto mt-12 max-w-6xl">
        <div className="relative w-full overflow-hidden rounded-xl border">
          <div className="relative w-full h-[220px] sm:h-[280px] md:h-[360px] lg:h-[420px]">
            <Image
              src="/section-banner.png"
              alt="Catlas banner"
              fill
              sizes="100vw"
              className="object-cover"
              priority={false}
            />
          </div>
        </div>
        <div className="mt-6 max-w-3xl mx-auto text-center">
          <h3 className="text-lg font-semibold mb-2">Turn moments into impact</h3>
          <p className="text-sm text-muted-foreground">
            Snap a cat, let AI help describe it, and mint a shareable ERC‑1155 collectible. Discover cats around the
            world, collect your favorites, and support animal welfare. Earnings split fairly: one third to the
            discoverer, one third to Catlas, one third to charity.
          </p>
          <div className="mt-4 flex items-center justify-center gap-3">
            <Link
              href="/upload"
              className="inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 disabled:opacity-50 disabled:pointer-events-none bg-primary text-primary-foreground shadow hover:bg-primary/90 h-9 px-4"
            >
              Upload a cat
            </Link>
            <Link
              href="/discover"
              className="inline-flex items-center justify-center rounded-md border text-sm font-medium h-9 px-4"
            >
              Explore cats
            </Link>
          </div>
        </div>
      </div>

      <div className="mx-auto mt-12 max-w-3xl text-center">
        <Card className="p-4 sm:p-6">
          <p className="text-sm sm:text-base">
            Ready to discover and support cats?
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
