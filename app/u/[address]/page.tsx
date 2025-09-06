import { CatListItem } from "@/components/cats/CatListItem";
import { UserHeader } from "@/components/user/UserHeader";
import { Card } from "@/components/ui/card";

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
        {/* Stats Card - populated client-side via API to keep server lean */}
        <Stats address={address} />
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

// Client Stats widget
// eslint-disable-next-line @typescript-eslint/no-unused-vars
function Stats({ address }: { address: string }) {
  // @ts-expect-error Client Component inline
  return <StatsClient address={address} />;
}

// Separate client file would be ideal; inlining here for brevity
// eslint-disable-next-line @next/next/no-async-client-component, react/display-name
const StatsClient = (function () {
  if (typeof window === "undefined") return function Placeholder() { return null; };
  // Dynamically define client component
  return function StatsClientInner({ address }: { address: string }) {
    const [loading, setLoading] = (require("react") as typeof import("react")).useState(true);
    const [stats, setStats] = (require("react") as typeof import("react")).useState<any>(null);
    (require("react") as typeof import("react")).useEffect(() => {
      const load = async () => {
        try {
          const res = await fetch(`/api/users/${address}`);
          const data = await res.json();
          setStats(data?.stats || null);
        } catch {}
        setLoading(false);
      };
      void load();
    }, [address]);
    return (
      <Card className="p-4 col-span-full">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div>
            <div className="text-xs text-muted-foreground">Discovered</div>
            <div className="text-lg font-semibold">{loading ? "-" : stats?.discovered ?? 0}</div>
          </div>
          <div>
            <div className="text-xs text-muted-foreground">Minted</div>
            <div className="text-lg font-semibold">{loading ? "-" : stats?.minted ?? 0}</div>
          </div>
          <div>
            <div className="text-xs text-muted-foreground">Earned</div>
            <div className="text-lg font-semibold">{loading ? "-" : `${Number((BigInt(stats?.earnedWei || 0n) as unknown as bigint)) / 1e18} ETH`}</div>
          </div>
          <div>
            <div className="text-xs text-muted-foreground">Likes</div>
            <div className="text-lg font-semibold">{loading ? "-" : stats?.likes ?? 0}</div>
          </div>
        </div>
      </Card>
    );
  };
})();


