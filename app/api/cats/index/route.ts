import { NextRequest, NextResponse } from "next/server";
import { getSupabaseClient } from "@/lib/supabase/client";

// POST body: { tokenId, creator, name, city, country, latitude, longitude, cid, metadata }
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const required = ["tokenId", "creator", "cid"];
    for (const k of required) if (body[k] === undefined || body[k] === null) return NextResponse.json({ error: `Missing ${k}` }, { status: 400 });
    const db = getSupabaseClient();
    const { error } = await db.from("cats").upsert({
      token_id: Number(body.tokenId),
      creator: String(body.creator).toLowerCase(),
      name: body.name || null,
      city: body.city || null,
      country: body.country || null,
      latitude: typeof body.latitude === "number" ? body.latitude : null,
      longitude: typeof body.longitude === "number" ? body.longitude : null,
      cid: body.cid,
      metadata: body.metadata ? body.metadata : {},
    });
    if (error) throw error;
    return NextResponse.json({ ok: true });
  } catch (e) {
    return NextResponse.json({ error: "Failed" }, { status: 500 });
  }
}


