import DiscoverCard from "@/components/discover/DiscoverCard";
import DiscoverMap from "./DiscoverMap";

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
          <DiscoverCard key={it.tokenId} item={it} />
        ))}
        {!items.length && <div className="text-sm text-muted-foreground">No cats yet.</div>}
        </div>
      </div>
    </section>
  );
}


