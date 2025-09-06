import { NextRequest, NextResponse } from "next/server";
import { getSupabaseClient } from "@/lib/supabase/client";
import { getPublicClient } from "@/lib/web3/client";
import { worldCat1155Abi } from "@/lib/web3/abi/Catlas1155";

async function fetchEnsName(address: string): Promise<string | null> {
  try {
    const res = await fetch(`https://ensdata.net/${address}`);
    if (!res.ok) return null;
    const data = await res.json();
    // ensdata returns { address, ens, primary, records... }
    // Prefer primary name
    const name = data?.primary || data?.ens || null;
    return typeof name === "string" && name.length ? name : null;
  } catch {
    return null;
  }
}

export async function GET(_req: NextRequest, { params }: { params: Promise<{ address: string }> }) {
  const { address: addr } = await params;
  const address = addr?.toLowerCase();
  if (!address) return NextResponse.json({ error: "missing address" }, { status: 400 });
  const db = getSupabaseClient();

  // Load user row
  const { data: userRow } = await db.from("users").select("address,username,ens").eq("address", address).maybeSingle();
  // Resolve ENS if not cached
  let ens = userRow?.ens || null;
  if (!ens) {
    ens = await fetchEnsName(address);
    if (ens) {
      await db.from("users").upsert({ address, ens });
    }
  }

  // Aggregated stats
  // discovered = rows in cats table where creator == address
  const { count: discoveredCount } = await db
    .from("cats")
    .select("token_id", { count: "exact", head: true })
    .eq("creator", address);

  // total mints = sum totalSupply for each discovered token via chain would be heavy; instead, estimate by counting
  // Since we do not index transfers, we approximate via total likes-based sorting path won't help. We'll query chain per token but keep it bounded by discoveredCount <= 200.
  // Fetch discovered token ids
  const { data: discoveredItems } = await db
    .from("cats")
    .select("token_id")
    .eq("creator", address)
    .limit(200);

  let totalMints = 0;
  if (discoveredItems && discoveredItems.length) {
    try {
      const client = getPublicClient();
      const contract = process.env.NEXT_PUBLIC_WORLDCAT1155_ADDRESS as `0x${string}`;
      if (contract) {
        const supplies = await Promise.all(
          discoveredItems.map(async (r: { token_id: number }) => {
            try {
              const v = (await client.readContract({
                address: contract,
                abi: worldCat1155Abi,
                functionName: "totalSupply",
                args: [BigInt(r.token_id)],
              })) as bigint;
              return Number(v);
            } catch {
              return 0;
            }
          })
        );
        totalMints = supplies.reduce((a, b) => a + b, 0);
      }
    } catch {}
  }

  // likes on discovered cats
  let totalLikes = 0;
  if (discoveredItems && discoveredItems.length) {
    const tokenIds = discoveredItems.map((r: { token_id: number }) => r.token_id);
    // Count likes per token in one query using IN
    const { data: likeRows } = await db
      .from("likes")
      .select("token_id")
      .in("token_id", tokenIds);
    totalLikes = likeRows ? likeRows.length : 0;
  }

  // earned = (total mints of their cats - number of cats discovered) * mintPrice
  // We read mintPrice from env since computing chain here adds weight; ensure NEXT_PUBLIC_MINT_PRICE_WEI exists as string
  const mintPriceWei = process.env.NEXT_PUBLIC_MINT_PRICE_WEI ? BigInt(process.env.NEXT_PUBLIC_MINT_PRICE_WEI) : 1000000000000000n; // 0.001 ETH default
  const discoveredNum = discoveredCount || 0;
  const mintedMinus = BigInt(Math.max(0, totalMints - discoveredNum));
  const earnedWei = (mintedMinus * mintPriceWei) / 3n; // 3-way split: creator, platform, charity

  return NextResponse.json({
    address,
    username: userRow?.username || null,
    ens,
    stats: {
      discovered: discoveredNum,
      minted: totalMints,
      earnedWei: earnedWei.toString(),
      likes: totalLikes,
    },
  });
}

export async function POST(req: NextRequest, { params }: { params: Promise<{ address: string }> }) {
  try {
    const { address: addr } = await params;
    const address = addr?.toLowerCase();
    const { username } = await req.json();
    const caller = req.headers.get("x-user-address")?.toLowerCase();
    if (!address || !caller || caller !== address) {
      return NextResponse.json({ error: "unauthorized" }, { status: 401 });
    }
    const db = getSupabaseClient();
    // Load current ens to validate reserved names
    const { data: userRow } = await db.from("users").select("ens").eq("address", address).maybeSingle();
    const ensName = userRow?.ens || (await fetchEnsName(address));

    const name = (username || "").trim();
    // Basic constraints: 2-32 chars, alnum, underscore, hyphen allowed
    const basicOk = /^[a-zA-Z0-9_-]{2,32}$/.test(name);
    const hasDot = name.includes(".");
    // If contains dot, must exactly equal ENS name
    if ((!basicOk && !(hasDot && ensName && name.toLowerCase() === ensName.toLowerCase())) || (hasDot && (!ensName || name.toLowerCase() !== ensName.toLowerCase()))) {
      return NextResponse.json({ error: "invalid_username" }, { status: 400 });
    }

    const { error } = await db.from("users").upsert({ address, username: name, ens: ensName || null });
    if (error) throw error;
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ ok: false }, { status: 500 });
  }
}


