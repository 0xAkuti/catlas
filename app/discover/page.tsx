import Link from "next/link";
import { ipfsToHttp } from "@/lib/ipfs/gateway";

type Item = { tokenId: number; name?: string; image?: string; city?: string; country?: string; latitude?: number; longitude?: number };

async function fetchCats(): Promise<Item[]> {
  const res = await fetch(`${process.env.NEXT_PUBLIC_APP_URL || ""}/api/cats`, { cache: "no-store" });
  if (!res.ok) return [];
  const json = await res.json();
  return json.items || [];
}

export default async function DiscoverPage() {
  const items = await fetchCats();
  return (
    <section className="py-8">
      <h2 className="text-xl font-semibold">Discover</h2>
      <p className="mt-2 text-sm text-muted-foreground">Explore recently published cats.</p>
      <div className="mt-6 grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          {/* Map Client Component */}
          {/* @ts-expect-error Server/Client boundary */}
          <DiscoverMap items={items} />
        </div>
        <div className="grid gap-4">
        {items.map((it) => (
          <Link key={it.tokenId} href={`/cat/${it.tokenId}`} className="rounded-lg border p-3 hover:bg-muted/40 transition">
            <div className="relative aspect-square w-full overflow-hidden rounded mb-3 bg-muted">
              {it.image ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={ipfsToHttp(it.image)} alt={it.name || "Cat"} className="w-full h-full object-cover" />
              ) : null}
            </div>
            <div className="text-sm font-medium truncate">{it.name || `Cat #${it.tokenId}`}</div>
            {(it.city || it.country) && (
              <div className="text-xs text-muted-foreground truncate">{[it.city, it.country].filter(Boolean).join(", ")}</div>
            )}
          </Link>
        ))}
        {!items.length && <div className="text-sm text-muted-foreground">No cats yet.</div>}
        </div>
      </div>
    </section>
  );
}


