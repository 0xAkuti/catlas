"use client";

import { useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { CatNftCard } from "@/components/nft/CatNftCard";
import { ImageCropper } from "@/components/upload/Cropper";
import exifr from "exifr";
import { compressToJpegSquare } from "@/lib/image/process";
import { Progress } from "@/components/ui/progress";
import { Input } from "@/components/ui/input";
import { worldCat1155Abi } from "@/lib/web3/abi/WorldCat1155";
import { getPublicClient } from "@/lib/web3/client";
import { usePrivy, useWallets } from "@privy-io/react-auth";
import { createWalletClient, custom, decodeEventLog } from "viem";
import { worldcatChain } from "@/lib/web3/client";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

type UploadStep = "select" | "crop" | "analyzing" | "result";

export default function UploadPage() {
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [step, setStep] = useState<UploadStep>("select");
  const [analysis, setAnalysis] = useState<any | null>(null);
  const [gps, setGps] = useState<{ lat: number; lng: number } | null>(null);
  const [progress, setProgress] = useState<number>(0);
  const [location, setLocation] = useState<{ city?: string; country?: string } | null>(null);
  const [title, setTitle] = useState<string>("");
  const { authenticated } = usePrivy();
  const { wallets } = useWallets();
  const router = useRouter();

  return (
    <section className="py-8">
      <h2 className="text-xl font-semibold">Upload</h2>
      <p className="mt-2 text-sm text-muted-foreground">
        Upload a photo or capture one. We’ll extract GPS if available.
      </p>

      <div className="mt-6">
        <div className="mb-4">
          <Progress value={
            step === "select" ? 10 :
            step === "crop" ? 40 :
            step === "analyzing" ? 75 :
            100
          } />
        </div>
        {step === "select" && (
          <div className="flex flex-col gap-4">
            <div>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                capture="environment"
                onChange={async (e) => {
                  const file = e.target.files?.[0] || null;
                  setSelectedFile(file);
                  if (previewUrl) URL.revokeObjectURL(previewUrl);
                  const url = file ? URL.createObjectURL(file) : null;
                  setPreviewUrl(url);
                  if (file) {
                    try {
                      const exif = await exifr.gps(file);
                      if (exif && exif.latitude && exif.longitude) {
                        setGps({ lat: exif.latitude, lng: exif.longitude });
                        try {
                          const resp = await fetch(
                            `/api/geocode/reverse?lat=${exif.latitude}&lon=${exif.longitude}`,
                          );
                          if (resp.ok) {
                            const loc = await resp.json();
                            setLocation(loc);
                          } else {
                            setLocation(null);
                          }
                        } catch {
                          setLocation(null);
                        }
                      } else {
                        setGps(null);
                        setLocation(null);
                      }
                    } catch {
                      setGps(null);
                      setLocation(null);
                    }
                    setStep("crop");
                  }
                }}
              />
              {selectedFile && (
                <p className="mt-2 text-xs text-muted-foreground">
                  Selected: {selectedFile.name}
                </p>
              )}
            </div>

            <div className="flex gap-3">
              <Button
                disabled={!selectedFile}
                onClick={async () => {
                  if (!selectedFile) return;
                  setStep("analyzing");
                  setProgress(75);
                  setAnalysis(null);
                  const buffer = await selectedFile.arrayBuffer();
                  const base64 = btoa(
                    new Uint8Array(buffer).reduce(
                      (acc, byte) => acc + String.fromCharCode(byte),
                      "",
                    ),
                  );
                  const res = await fetch("/api/analyze", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ imageBase64: base64, gps }),
                  });
                  const json = await res.json();
                  setAnalysis(json?.result || null);
                  if (json?.result?.title) setTitle(json.result.title);
                  setStep("result");
                  setProgress(100);
                }}
              >
                Analyze
              </Button>
              <Button
                variant="secondary"
                onClick={() => {
                  setSelectedFile(null);
                  if (previewUrl) URL.revokeObjectURL(previewUrl);
                  setPreviewUrl(null);
                  setGps(null);
                  setLocation(null);
                }}
              >
                Clear
              </Button>
            </div>
          </div>
        )}

        {step === "crop" && previewUrl && (
          <div className="rounded-lg border overflow-hidden">
            <ImageCropper
              imageUrl={previewUrl}
              onCancel={() => {
                setStep("select");
              }}
              onCropped={async (blob) => {
                const compressed = await compressToJpegSquare(blob, 1024);
                const file = new File([compressed], "cropped.jpg", { type: "image/jpeg" });
                setSelectedFile(file);
                if (previewUrl) URL.revokeObjectURL(previewUrl);
                const nextUrl = URL.createObjectURL(file);
                setPreviewUrl(nextUrl);
                setStep("select");
              }}
            />
          </div>
        )}

        {step === "analyzing" && (
          <div className="flex flex-col items-center gap-4">
            <div className="rounded-lg border w-full h-48 bg-muted/20 flex items-center justify-center text-sm text-muted-foreground">
              Analyzing image...
            </div>
            <p className="text-xs text-muted-foreground">This may take a few seconds.</p>
          </div>
        )}

        {step === "result" && (
          <div className="flex flex-col gap-4">
            <div className="mx-auto w-full max-w-md">
              <div className="mb-3">
                <label className="text-sm font-medium">Title</label>
                <Input
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Enter a title for this cat"
                />
              </div>
              <CatNftCard
                classification={{ ...(analysis || { isCat: false }), title }}
                imageUrl={previewUrl}
                location={location || undefined}
              />
            </div>
            <div className="flex gap-3">
              <Button onClick={() => setStep("select")}>Back</Button>
              <Button
                onClick={async () => {
                  if (!selectedFile || !analysis?.isCat) return;
                  // Build metadata JSON
                  const metadata = {
                    name: title || analysis.title || "Untitled Cat",
                    description: analysis.sceneDescription || "",
                    // Custom fields for frontend consumption
                    location_city: location?.city || undefined,
                    location_country: location?.country || undefined,
                    latitude: gps?.lat || undefined,
                    longitude: gps?.lng || undefined,
                    attributes: [
                      { trait_type: "Breed", value: analysis.breed || "Unknown" },
                      { trait_type: "Color", value: analysis.color || "Unknown" },
                      analysis.pattern ? { trait_type: "Pattern", value: analysis.pattern } : null,
                      analysis.bodyType ? { trait_type: "Body Type", value: analysis.bodyType } : null,
                      analysis.eyeColor ? { trait_type: "Eyes", value: analysis.eyeColor } : null,
                      analysis.pose ? { trait_type: "Pose", value: analysis.pose } : null,
                      location?.city || location?.country
                        ? { trait_type: "Location", value: `${location?.city || ""}${location?.city && location?.country ? ", " : ""}${location?.country || ""}` }
                        : null,
                    ].filter(Boolean),
                  };

                  const form = new FormData();
                  form.append("image", selectedFile);
                  form.append("metadata", JSON.stringify(metadata));
                  const resp = await fetch("/api/ipfs/upload", { method: "POST", body: form });
                  const data = await resp.json();
                  if (!data?.cid) return;

                  // On-chain publishCat
                  if (!authenticated || !wallets[0]) return;
                  const provider = await wallets[0].getEthereumProvider?.();
                  if (!provider) return;
                  const walletClient = createWalletClient({ chain: worldcatChain, transport: custom(provider) });
                  const contractAddress = process.env.NEXT_PUBLIC_WORLDCAT1155_ADDRESS as `0x${string}`;
                  if (!contractAddress) return;
                  const account = wallets[0].address as `0x${string}`;
                  const hash = await walletClient.writeContract({
                    chain: worldcatChain,
                    account,
                    address: contractAddress,
                    abi: worldCat1155Abi,
                    functionName: "publishCat",
                    args: [data.cid],
                  });
                  const publicClient = getPublicClient();
                  const receipt = await publicClient.waitForTransactionReceipt({ hash });
                  let newId: number | null = null;
                  for (const lg of receipt.logs) {
                    try {
                      const ev = decodeEventLog({ abi: worldCat1155Abi as any, data: lg.data, topics: lg.topics }) as any;
                      if (ev.eventName === "CatPublished") {
                        newId = Number(ev.args.tokenId as bigint);
                        break;
                      }
                    } catch {}
                  }
                  if (newId !== null) {
                    // Upsert into Supabase index
                    try {
                      // Use same metadata we used for IPFS, but ensure image is set from imageCid for the DB record
                      const metadataForDb = {
                        ...metadata,
                        image: data?.imageCid ? `ipfs://${data.imageCid}` : (metadata as any).image,
                      } as any;
                      await fetch("/api/cats/index", {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({
                          tokenId: newId,
                          creator: account,
                          name: metadataForDb.name,
                          city: metadataForDb.location_city,
                          country: metadataForDb.location_country,
                          latitude: metadataForDb.latitude,
                          longitude: metadataForDb.longitude,
                          cid: data.cid,
                          metadata: metadataForDb,
                        }),
                      });
                    } catch {}
                    const explorerBase = worldcatChain?.blockExplorers?.default?.url;
                    const txUrl = explorerBase ? `${explorerBase}/tx/${hash}` : undefined;
                    toast.success("Cat published!", {
                      description: `Token #${newId} was created successfully`,
                      action: txUrl ? {
                        label: "View Tx",
                        onClick: () => {
                          window.open(txUrl, "_blank");
                        }
                      } : undefined,
                    });
                    router.push(`/cat/${newId}`);
                  }
                }}
              >
                Publish
              </Button>
              <Button
                variant="secondary"
                onClick={() => {
                  setSelectedFile(null);
                  if (previewUrl) URL.revokeObjectURL(previewUrl);
                  setPreviewUrl(null);
                  setAnalysis(null);
                  setTitle("");
                  setStep("select");
                }}
              >
                Analyze another
              </Button>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}


