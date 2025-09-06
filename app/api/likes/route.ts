import { NextRequest, NextResponse } from "next/server";
import { getSupabaseClient } from "@/lib/supabase/client";

// POST { tokenId } toggles like for current user (address required in header X-User-Address)
export async function POST(req: NextRequest) {
  try {
    const { tokenId } = await req.json();
    const address = req.headers.get("x-user-address");
    if (!address || typeof tokenId !== "number") {
      return NextResponse.json({ error: "Missing address or tokenId" }, { status: 400 });
    }
    const db = getSupabaseClient();

    // Check if exists
    const { data: existing, error: selErr } = await db
      .from("likes")
      .select("id")
      .eq("token_id", tokenId)
      .eq("user_address", address.toLowerCase())
      .limit(1)
      .maybeSingle();
    if (selErr) throw selErr;

    if (existing) {
      const { error: delErr } = await db
        .from("likes")
        .delete()
        .eq("id", existing.id);
      if (delErr) throw delErr;
      return NextResponse.json({ liked: false });
    } else {
      const { error: insErr } = await db
        .from("likes")
        .insert({ token_id: tokenId, user_address: address.toLowerCase() });
      if (insErr) throw insErr;
      return NextResponse.json({ liked: true });
    }
  } catch {
    return NextResponse.json({ error: "Failed" }, { status: 500 });
  }
}

// GET ?tokenId= -> returns { total, liked }
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const tokenIdStr = searchParams.get("tokenId");
    const address = (searchParams.get("address") || "").toLowerCase();
    const tokenId = tokenIdStr !== null ? Number(tokenIdStr) : NaN;
    if (Number.isNaN(tokenId)) return NextResponse.json({ total: 0, liked: false });
    const db = getSupabaseClient();
    const { count } = await db
      .from("likes")
      .select("id", { count: "exact", head: true })
      .eq("token_id", tokenId);
    let liked = false;
    if (address) {
      const { data } = await db
        .from("likes")
        .select("id")
        .eq("token_id", tokenId)
        .eq("user_address", address)
        .limit(1);
      liked = !!(data && data.length);
    }
    return NextResponse.json({ total: count || 0, liked });
  } catch {
    return NextResponse.json({ total: 0, liked: false });
  }
}


