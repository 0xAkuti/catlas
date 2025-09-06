import { CatListItem } from "@/components/cats/CatListItem";
import Controls from "./Controls";
import DiscoverMap from "./DiscoverMap";

type Item = { tokenId: number; name?: string; image?: string; city?: string; country?: string; latitude?: number; longitude?: number };

async function fetchCats(q?: string, sort?: string): Promise<Item[]> {
  const qs = new URLSearchParams();
  if (q) qs.set("q", q);
  if (sort) qs.set("sort", sort);
  const res = await fetch(`${process.env.NEXT_PUBLIC_APP_URL || ""}/api/cats?${qs.toString()}`, { cache: "no-store" });
  if (!res.ok) return [];
  const json = await res.json();
  return json.items || [];
}

export default async function DiscoverPage({ searchParams }: { searchParams: { q?: string; sort?: string } }) {
  const q = searchParams?.q || "";
  const sort = searchParams?.sort || "newest";
  const items = await fetchCats(q, sort);
  return (
    <section className="py-8">
      <h2 className="text-xl font-semibold">Discover</h2>
      <p className="mt-2 text-sm text-muted-foreground">Explore recently published cats.</p>
      <Controls q={q} sort={sort} />
      <div className="mt-6 grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          {/* Map Client Component */}
          {/* @ts-expect-error Server/Client boundary */}
          <DiscoverMap items={items} />
        </div>
        <div className="flex flex-col gap-3">
          {items.map((it) => (
            // @ts-expect-error Server/Client boundary
            <CatListItem key={it.tokenId} item={it} />
          ))}
          {!items.length && <div className="text-sm text-muted-foreground">No cats yet.</div>}
        </div>
      </div>
    </section>
  );
}


