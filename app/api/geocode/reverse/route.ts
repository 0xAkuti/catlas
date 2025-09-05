import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const lat = searchParams.get("lat");
  const lon = searchParams.get("lon") || searchParams.get("lng");
  if (!lat || !lon) {
    return NextResponse.json({ error: "Missing lat/lon" }, { status: 400 });
  }

  const email = process.env.NOMINATIM_EMAIL;
  const url = new URL("https://nominatim.openstreetmap.org/reverse");
  url.searchParams.set("format", "jsonv2");
  url.searchParams.set("lat", lat);
  url.searchParams.set("lon", lon);
  url.searchParams.set("zoom", "10");
  url.searchParams.set("addressdetails", "1");
  if (email) url.searchParams.set("email", email);

  try {
    const res = await fetch(url.toString(), {
      headers: {
        "User-Agent": `WorldCat/1.0 (${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"})`,
        Referer: process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000",
      },
      // Nominatim discourages heavy usage; keep default caching minimal
      cache: "no-store",
    });
    if (!res.ok) {
      return NextResponse.json({ error: "Reverse geocode failed" }, { status: 502 });
    }
    const data = await res.json();
    const address = data?.address || {};
    const city = address.city || address.town || address.village || address.hamlet || null;
    const country = address.country || null;
    return NextResponse.json({ city, country });
  } catch (err) {
    console.error("/api/geocode/reverse error", err);
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}


