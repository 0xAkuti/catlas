import { NextRequest, NextResponse } from "next/server";
import { createPinataClient } from "@/lib/ipfs/client";

export async function POST(req: NextRequest) {
  try {
    const form = await req.formData();
    const image = form.get("image") as File | null;
    const metadata = form.get("metadata") as string | null;
    if (!image || !metadata) {
      return NextResponse.json({ error: "Missing image or metadata" }, { status: 400 });
    }

    const pinata = createPinataClient();
    // 1) Upload image -> get image CID
    const imageFile = new File([image], "image.jpg", { type: image.type || "image/jpeg" });
    const imageRes = await pinata.upload.public.file(imageFile).group("237b4ab8-44c7-48ed-a004-f8236dca1f77");
    const imageCid = imageRes.cid || imageRes.id; // handle SDK response variants

    // 2) Patch metadata.image to ipfs://imageCid
    let parsed: any;
    try {
      parsed = JSON.parse(metadata);
    } catch {
      return NextResponse.json({ error: "Invalid metadata" }, { status: 400 });
    }
    parsed.image = `ipfs://${imageCid}`;
    const metadataFile = new File([JSON.stringify(parsed)], "metadata.json", { type: "application/json" });
    const metadataRes = await pinata.upload.public.file(metadataFile);
    const cid = metadataRes.cid || metadataRes.id;
    return NextResponse.json({ cid, imageCid });
  } catch (err) {
    console.error("/api/ipfs/upload error", err);
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}


