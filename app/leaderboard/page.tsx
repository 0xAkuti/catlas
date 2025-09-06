import { CatListItem } from "@/components/cats/CatListItem";

type Item = { tokenId: number; name?: string; image?: string; city?: string; country?: string };

async function fetchMostLiked(): Promise<Item[]> {
  const qs = new URLSearchParams({ sort: "most_liked" });
  const res = await fetch(`${process.env.NEXT_PUBLIC_APP_URL || ""}/api/cats?${qs.toString()}`, { cache: "no-store" });
  if (!res.ok) return [];
  const json = await res.json();
  return json.items || [];
}

export default async function LeaderboardPage() {
  const items = await fetchMostLiked();
  return (
    <section className="py-8">
      <h2 className="text-xl font-semibold">Most liked cats</h2>
      <div className="mt-6 flex flex-col gap-3">
        {items.map((it) => (
          <CatListItem key={it.tokenId} item={it} />
        ))}
        {!items.length && <div className="text-sm text-muted-foreground">No cats yet.</div>}
      </div>
    </section>
  );
}


