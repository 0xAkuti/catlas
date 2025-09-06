import { NextRequest, NextResponse } from "next/server";
import { getPublicClient } from "@/lib/web3/client";
import { worldCat1155Abi } from "@/lib/web3/abi/WorldCat1155";
import { ipfsToHttp } from "@/lib/ipfs/gateway";
import { decodeEventLog } from "viem";

export async function GET(req: NextRequest) {
  try {
    const client = getPublicClient();
    const address = process.env.NEXT_PUBLIC_WORLDCAT1155_ADDRESS as `0x${string}`;
    if (!address) return NextResponse.json({ items: [] });

    const { searchParams } = new URL(req.url);
    const creator = searchParams.get("creator");
    const owner = searchParams.get("owner");

    const latest = await client.getBlockNumber();
    const fromBlock = latest > 5000n ? latest - 5000n : 0n;
    const logs = await client.getLogs({
      address,
      fromBlock,
      toBlock: latest,
    });

    const items: any[] = [];
    for (const log of logs.slice(-200)) {
      try {
        const ev = decodeEventLog({ abi: worldCat1155Abi as any, data: log.data, topics: log.topics }) as any;
        if (ev.eventName !== "CatPublished") continue;
        const tokenId = Number(ev.args.tokenId as bigint);
        const evCreator = (ev.args.creator as string).toLowerCase();
        if (creator && evCreator !== creator.toLowerCase()) continue;
        const uri = await client.readContract({ address, abi: worldCat1155Abi as any, functionName: "uri", args: [BigInt(tokenId)] });
        const res = await fetch(ipfsToHttp(uri as string), { cache: "no-store" });
        if (!res.ok) continue;
        const meta = await res.json();
        if (owner) {
          const bal = (await client.readContract({ address, abi: worldCat1155Abi as any, functionName: "balanceOf", args: [owner as `0x${string}`, BigInt(tokenId)] })) as bigint;
          if (bal === 0n) continue;
        }
        items.push({
          tokenId,
          name: meta?.name,
          image: meta?.image,
          city: meta?.location_city,
          country: meta?.location_country,
          latitude: typeof meta?.latitude === "number" ? meta.latitude : undefined,
          longitude: typeof meta?.longitude === "number" ? meta.longitude : undefined,
        });
      } catch {}
    }

    // newest first
    items.reverse();
    return NextResponse.json({ items });
  } catch (e) {
    return NextResponse.json({ items: [], error: "failed" }, { status: 500 });
  }
}


