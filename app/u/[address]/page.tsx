import { CatListItem } from "@/components/cats/CatListItem";
import { UserHeader } from "@/components/user/UserHeader";
import { UserStats } from "@/components/user/UserStats";

type Item = { tokenId: number; name?: string; image?: string; city?: string; country?: string };

async function fetchCats(qs: string): Promise<Item[]> {
  const res = await fetch(`${process.env.NEXT_PUBLIC_APP_URL || ""}/api/cats?${qs}`, { cache: "no-store" });
  if (!res.ok) return [];
  const json = await res.json();
  return json.items || [];
}

export default async function UserPage({ params }: { params: { address: string } }) {
  const { address } = await params;
  const discovered = await fetchCats(`creator=${address}`);
  const collected = await fetchCats(`owner=${address}`);

  return (
    <section className="py-8">
      {/* @ts-expect-error Server/Client boundary */}
      <UserHeader address={address} />
      <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {/* @ts-expect-error Server/Client boundary */}
        <UserStats address={address} />
      </div>
      <div className="mt-6 grid gap-8 lg:grid-cols-2">
        <div>
          <h3 className="text-base font-semibold mb-3">Discovered</h3>
          <div className="grid gap-3">
            {discovered.map((it) => (
              // @ts-expect-error Server/Client boundary
              <CatListItem key={it.tokenId} item={it} />
            ))}
            {!discovered.length && <div className="text-sm text-muted-foreground">No discovered cats.</div>}
          </div>
        </div>
        <div>
          <h3 className="text-base font-semibold mb-3">Collected</h3>
          <div className="grid gap-3">
            {collected.map((it) => (
              // @ts-expect-error Server/Client boundary
              <CatListItem key={it.tokenId} item={it} />
            ))}
            {!collected.length && <div className="text-sm text-muted-foreground">No collected cats.</div>}
          </div>
        </div>
      </div>
    </section>
  );
}

// removed inline Stats; using UserStats client component


