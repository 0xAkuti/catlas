import Link from "next/link";
import { ipfsToHttp } from "@/lib/ipfs/gateway";

type Item = { tokenId: number; name?: string; image?: string; city?: string; country?: string };

async function fetchCats(qs: string): Promise<Item[]> {
  const res = await fetch(`${process.env.NEXT_PUBLIC_APP_URL || ""}/api/cats?${qs}`, { cache: "no-store" });
  if (!res.ok) return [];
  const json = await res.json();
  return json.items || [];
}

export default async function UserPage({ params }: { params: { address: string } }) {
  const address = params.address;
  const discovered = await fetchCats(`creator=${address}`);
  const collected = await fetchCats(`owner=${address}`);

  return (
    <section className="py-8">
      <h2 className="text-xl font-semibold">User {address.slice(0, 6)}…{address.slice(-4)}</h2>
      <div className="mt-6 grid gap-8 lg:grid-cols-2">
        <div>
          <h3 className="text-base font-semibold mb-3">Discovered</h3>
          <div className="grid gap-3">
            {discovered.map((it) => (
              <Link key={it.tokenId} href={`/cat/${it.tokenId}`} className="rounded-lg border p-3 hover:bg-muted/40 transition">
                <div className="relative aspect-square w-full overflow-hidden rounded mb-3 bg-muted">
                  {it.image && (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={ipfsToHttp(it.image)} alt={it.name || "Cat"} className="w-full h-full object-cover" />
                  )}
                </div>
                <div className="text-sm font-medium truncate">{it.name || `Cat #${it.tokenId}`}</div>
                {(it.city || it.country) && (
                  <div className="text-xs text-muted-foreground truncate">{[it.city, it.country].filter(Boolean).join(", ")}</div>
                )}
              </Link>
            ))}
            {!discovered.length && <div className="text-sm text-muted-foreground">No discovered cats.</div>}
          </div>
        </div>
        <div>
          <h3 className="text-base font-semibold mb-3">Collected</h3>
          <div className="grid gap-3">
            {collected.map((it) => (
              <Link key={it.tokenId} href={`/cat/${it.tokenId}`} className="rounded-lg border p-3 hover:bg-muted/40 transition">
                <div className="relative aspect-square w-full overflow-hidden rounded mb-3 bg-muted">
                  {it.image && (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={ipfsToHttp(it.image)} alt={it.name || "Cat"} className="w-full h-full object-cover" />
                  )}
                </div>
                <div className="text-sm font-medium truncate">{it.name || `Cat #${it.tokenId}`}</div>
                {(it.city || it.country) && (
                  <div className="text-xs text-muted-foreground truncate">{[it.city, it.country].filter(Boolean).join(", ")}</div>
                )}
              </Link>
            ))}
            {!collected.length && <div className="text-sm text-muted-foreground">No collected cats.</div>}
          </div>
        </div>
      </div>
    </section>
  );
}


