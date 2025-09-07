import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { worldCat1155Abi } from "@/lib/web3/abi/Catlas1155";
import { getPublicClient } from "@/lib/web3/client";
import { ipfsToHttp } from "@/lib/ipfs/gateway";
import CatNftWithLikes from "@/components/nft/CatNftWithLikes";
import { Binoculars } from "lucide-react";
import { getSupabaseClient } from "@/lib/supabase/client";

type Props = { params: { id: string } };

export default async function CatPage({ params }: Props) {
  const { id } = await params;
  const idNum = Number(id);
  if (!Number.isFinite(idNum)) return notFound();

  const client = getPublicClient();
  // Fetch metadata URI and then fetch JSON
  let uri: string;
  try {
    uri = await client.readContract({
      address: process.env.NEXT_PUBLIC_WORLDCAT1155_ADDRESS as `0x${string}`,
      abi: worldCat1155Abi,
      functionName: "uri",
      args: [BigInt(idNum)],
    });
  } catch {
    return notFound();
  }

  const res = await fetch(ipfsToHttp(uri), { cache: "no-store" });
  if (!res.ok) return notFound();
  const meta = await res.json();

  const imageUrl = meta.image ? ipfsToHttp(meta.image) : null;
  const classification = {
    isCat: true,
    title: meta.name,
    breed: meta.attributes?.find?.((a: { trait_type: string; value: string }) => a.trait_type === "Breed")?.value,
    color: meta.attributes?.find?.((a: { trait_type: string; value: string }) => a.trait_type === "Color")?.value,
    pattern: meta.attributes?.find?.((a: { trait_type: string; value: string }) => a.trait_type === "Pattern")?.value,
    bodyType: meta.attributes?.find?.((a: { trait_type: string; value: string }) => a.trait_type === "Body Type")?.value,
    eyeColor: meta.attributes?.find?.((a: { trait_type: string; value: string }) => a.trait_type === "Eyes")?.value,
    pose: meta.attributes?.find?.((a: { trait_type: string; value: string }) => a.trait_type === "Pose")?.value,
    sceneDescription: meta.description,
  };
  const location = meta.location_city || meta.location_country
    ? { city: meta.location_city, country: meta.location_country }
    : undefined;

  // Fetch discoverer from Supabase and display name
  const db = getSupabaseClient();
  const { data: catRow } = await db
    .from("cats")
    .select("creator")
    .eq("token_id", idNum)
    .maybeSingle();
  const creator = (catRow?.creator as string | undefined) || undefined;

  let displayName: string | null = null;
  if (creator) {
    try {
      const resUser = await fetch(`${process.env.NEXT_PUBLIC_APP_URL || ""}/api/users/${creator}`, { cache: "no-store" });
      if (resUser.ok) {
        const uj = await resUser.json();
        displayName = uj?.username || uj?.ens || null;
      }
    } catch {}
  }

  const shorten = (addr: string) => addr ? `${addr.slice(0, 6)}...${addr.slice(-4)}` : "";

  return (
    <section className="py-8">
      <div className="mx-auto w-full max-w-md">
        <CatNftWithLikes
          tokenId={idNum}
          classification={classification}
          imageUrl={imageUrl}
          location={location}
          discovererName={(displayName || (creator ? shorten(creator) : null))}
          discovererAddress={creator || null}
        />
      </div>
      
    </section>
  );
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  const idNum = Number(id);
  if (!Number.isFinite(idNum)) return {};
  try {
    const client = getPublicClient();
    const uri = (await client.readContract({
      address: process.env.NEXT_PUBLIC_WORLDCAT1155_ADDRESS as `0x${string}`,
      abi: worldCat1155Abi,
      functionName: "uri",
      args: [BigInt(idNum)],
    })) as string;
    const res = await fetch(ipfsToHttp(uri), { cache: "no-store" });
    if (!res.ok) return {};
    const meta = await res.json();
    const imageUrl = meta.image ? ipfsToHttp(meta.image) : undefined;
    const title = meta.name ? `${meta.name} — Catlas` : `Cat #${idNum} — Catlas`;
    const description = meta.description || "Discovered on Catlas";
    return {
      title,
      description,
      openGraph: {
        title,
        description,
        images: imageUrl ? [{ url: imageUrl }] : undefined,
        url: `/cat/${idNum}`,
        type: "article",
      },
      twitter: {
        card: "summary_large_image",
        title,
        description,
        images: imageUrl ? [imageUrl] : undefined,
      },
    } satisfies Metadata;
  } catch {
    return {};
  }
}


