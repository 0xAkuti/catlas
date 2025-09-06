import { NextRequest, NextResponse } from "next/server";
import { getPublicClient } from "@/lib/web3/client";
import { worldCat1155Abi } from "@/lib/web3/abi/Catlas1155";
import { getSupabaseClient } from "@/lib/supabase/client";
// import { decodeEventLog } from "viem";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const creator = searchParams.get("creator");
    const owner = searchParams.get("owner");
    const q = (searchParams.get("q") || "").trim();
    const sort = (searchParams.get("sort") || "newest").toLowerCase();

    // If owner is requested (collected view), use Supabase list and filter via balanceOf per token (no log scanning).
    if (owner) {
      const db = getSupabaseClient();
      const { data, error } = await db
        .from("cats")
        .select("token_id,name,city,country,latitude,longitude,metadata,created_at")
        .order("created_at", { ascending: false })
        .limit(200);
      if (error) throw error;

      const client = getPublicClient();
      const address = process.env.NEXT_PUBLIC_WORLDCAT1155_ADDRESS as `0x${string}`;
      if (!address) return NextResponse.json({ items: [] });

      const checks = await Promise.all(
        (data || []).map(async (row: { token_id: number; name: string | null; city: string | null; country: string | null; latitude: number | null; longitude: number | null; metadata: { image?: string } | null; }) => {
          try {
            const bal = (await client.readContract({
              address,
              abi: worldCat1155Abi as any,
              functionName: "balanceOf",
              args: [owner as `0x${string}`, BigInt(row.token_id)],
            })) as bigint;
            if (bal > 0n) {
              return {
                tokenId: row.token_id,
                name: row.name,
                image: row.metadata?.image,
                city: row.city,
                country: row.country,
                latitude: row.latitude ?? undefined,
                longitude: row.longitude ?? undefined,
              };
            }
          } catch {}
          return null;
        })
      );
      const items = checks.filter(Boolean) as { tokenId: number; name: string | null; image?: string; city: string | null; country: string | null; latitude?: number; longitude?: number }[];
      return NextResponse.json({ items });
    }

    // Otherwise use Supabase index for discover/search
    const db = getSupabaseClient();
    let query = db
      .from("cats")
      .select("token_id,name,city,country,latitude,longitude,metadata,cid,creator,created_at")
      .limit(60);
    if (creator) {
      query = query.eq("creator", creator.toLowerCase());
    }
    if (q) {
      const like = `%${q}%`;
      // Search common fields and a few metadata keys
      query = query.or(
        [
          `name.ilike.${like}`,
          `city.ilike.${like}`,
          `country.ilike.${like}`,
          `metadata->>description.ilike.${like}`,
          `metadata->>breed.ilike.${like}`,
          `metadata->>color.ilike.${like}`,
          `metadata->>pattern.ilike.${like}`,
        ].join(",")
      );
    }
    if (sort === "oldest") {
      query = query.order("created_at", { ascending: true });
    } else {
      // newest or default
      query = query.order("created_at", { ascending: false });
    }
    const { data, error } = await query;
    if (error) throw error;
    let items = (data || []).map((row: { token_id: number; name: string | null; city: string | null; country: string | null; latitude: number | null; longitude: number | null; metadata: { image?: string } | null; }) => ({
      tokenId: row.token_id,
      name: row.name,
      image: row.metadata?.image || undefined,
      city: row.city,
      country: row.country,
      latitude: row.latitude ?? undefined,
      longitude: row.longitude ?? undefined,
    }));
    if (sort === "most_liked" && items.length) {
      // Compute likes counts per token and sort desc
      const counts = await Promise.all(
        items.map(async (it) => {
          const { count } = await db
            .from("likes")
            .select("id", { count: "exact", head: true })
            .eq("token_id", it.tokenId);
          return [it.tokenId, count || 0] as [number, number];
        })
      );
      const map = new Map<number, number>(counts);
      items.sort((a, b) => (map.get(b.tokenId) || 0) - (map.get(a.tokenId) || 0));
    }
    return NextResponse.json({ items });
  } catch {
    return NextResponse.json({ items: [], error: "failed" }, { status: 500 });
  }
}


