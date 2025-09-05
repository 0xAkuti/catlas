import { NextRequest, NextResponse } from "next/server";
import { createWeb3StorageClient } from "@/lib/ipfs/client";

export async function POST(req: NextRequest) {
  try {
    const form = await req.formData();
    const image = form.get("image") as File | null;
    const metadata = form.get("metadata") as string | null;
    if (!image || !metadata) {
      return NextResponse.json({ error: "Missing image or metadata" }, { status: 400 });
    }

    const client = createWeb3StorageClient();
    const files: File[] = [];
    files.push(new File([image], "image.jpg", { type: image.type || "image/jpeg" }));
    files.push(new File([metadata], "metadata.json", { type: "application/json" }));

    const cid = await client.put(files, { wrapWithDirectory: true, name: "worldcat-upload" });
    return NextResponse.json({ cid });
  } catch (err) {
    console.error("/api/ipfs/upload error", err);
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}


