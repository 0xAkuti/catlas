import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const lat = searchParams.get("lat");
  const lon = searchParams.get("lon") || searchParams.get("lng");
  if (!lat || !lon) {
    return NextResponse.json({ error: "Missing lat/lon" }, { status: 400 });
  }

  const url = new URL("https://api.bigdatacloud.net/data/reverse-geocode-client");
  url.searchParams.set("latitude", lat);
  url.searchParams.set("longitude", lon);
  url.searchParams.set("localityLanguage", "en");

  try {
    const res = await fetch(url.toString(), { cache: "no-store" });
    if (!res.ok) {
      return NextResponse.json({ error: "Reverse geocode failed" }, { status: 502 });
    }
    const data = await res.json();
    const city = data?.city || data?.locality || null;
    const country = data?.countryName || null;
    return NextResponse.json({ city, country });
  } catch (err) {
    console.error("/api/geocode/reverse error", err);
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}


