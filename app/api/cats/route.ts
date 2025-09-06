import { NextRequest, NextResponse } from "next/server";
import { getPublicClient } from "@/lib/web3/client";
import { worldCat1155Abi } from "@/lib/web3/abi/WorldCat1155";
import { getSupabaseClient } from "@/lib/supabase/client";
import { decodeEventLog } from "viem";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const creator = searchParams.get("creator");
    const owner = searchParams.get("owner");

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
        (data || []).map(async (row: any) => {
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
      const items = checks.filter(Boolean);
      return NextResponse.json({ items });
    }

    // Otherwise use Supabase index for discover/search
    const db = getSupabaseClient();
    let query = db.from("cats").select("token_id,name,city,country,latitude,longitude,metadata,cid,creator,created_at").order("created_at", { ascending: false }).limit(60);
    if (creator) {
      query = query.eq("creator", creator.toLowerCase());
    }
    const { data, error } = await query;
    if (error) throw error;
    const items = (data || []).map((row: any) => ({
      tokenId: row.token_id,
      name: row.name,
      image: row.metadata?.image || (row.cid ? `ipfs://${row.cid}` : undefined),
      city: row.city,
      country: row.country,
      latitude: row.latitude ?? undefined,
      longitude: row.longitude ?? undefined,
    }));
    return NextResponse.json({ items });
  } catch (e) {
    return NextResponse.json({ items: [], error: "failed" }, { status: 500 });
  }
}


