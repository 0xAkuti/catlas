"use client";

import { useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { CatNftCard } from "@/components/nft/CatNftCard";
import { ImageCropper } from "@/components/upload/Cropper";
import UploadStepper from "@/components/comp-523";
import ImageUploader from "@/components/comp-544";
import exifr from "exifr";
import { compressToJpegSquare } from "@/lib/image/process";
// import { Progress } from "@/components/ui/progress";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { worldCat1155Abi } from "@/lib/web3/abi/Catlas1155";
import { getPublicClient } from "@/lib/web3/client";
import { usePrivy, useWallets } from "@privy-io/react-auth";
import { createWalletClient, custom, decodeEventLog } from "viem";
import { catlasChain } from "@/lib/web3/client";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { LoaderThree } from "@/components/ui/loader";
import { Rocket } from "lucide-react";

type UploadStep = "select" | "crop" | "analyzing" | "result";

export default function UploadPage() {
  // const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [step, setStep] = useState<UploadStep>("select");
  type Analysis = {
    isCat: boolean;
    title?: string;
    breed?: string;
    color?: string;
    pattern?: string;
    bodyType?: string;
    eyeColor?: string;
    pose?: string;
    sceneDescription?: string;
    welfareCheck?: {
      attentionNeeded: boolean;
      indicators?: string[];
      recommendation?: string;
    };
    [key: string]: unknown;
  };
  const [analysis, setAnalysis] = useState<Analysis | null>(null);
  const [gps, setGps] = useState<{ lat: number; lng: number } | null>(null);
  const [progress, setProgress] = useState<number>(0); // reserved
  const [location, setLocation] = useState<{ city?: string; country?: string } | null>(null);
  const [title, setTitle] = useState<string>("");
  const { authenticated } = usePrivy();
  const { wallets } = useWallets();
  const router = useRouter();
  const analyzeIdRef = useRef(0);
  const [showHealthNotice, setShowHealthNotice] = useState(false);

  return (
    <section className="py-8">
      <h2 className="text-xl font-semibold">Upload</h2>

      <div className="mt-6">
        <div className="mb-6">
          <UploadStepper value={step === "select" ? 1 : step === "crop" ? 2 : step === "analyzing" ? 3 : 4} />
        </div>
        {step === "select" && (
          <div className="flex flex-col gap-4">
            <ImageUploader onSelected={async (file, preview) => {
              // Reset analysis state for a fresh upload
              analyzeIdRef.current++;
              setAnalysis(null);
              setTitle("");
              setSelectedFile(file);
              if (previewUrl) URL.revokeObjectURL(previewUrl);
              setPreviewUrl(preview);
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
            }} />

            <div className="flex gap-3">
              <Button
                disabled={!selectedFile}
                onClick={async () => {
                  if (!selectedFile) return;
                  setStep("analyzing");
                  setProgress(75);
                  setAnalysis(null);
                  const myId = ++analyzeIdRef.current;
                  const base64 = await new Promise<string>((resolve, reject) => {
                    const reader = new FileReader();
                    reader.onload = () => {
                      try {
                        const result = reader.result as string;
                        const b64 = result.split(",")[1] || result;
                        resolve(b64);
                      } catch (e) {
                        reject(e);
                      }
                    };
                    reader.onerror = reject;
                    reader.readAsDataURL(selectedFile);
                  });
                  const res = await fetch("/api/analyze", {
                    method: "POST",
                    cache: "no-store",
                    headers: { "Content-Type": "application/json", "Cache-Control": "no-store" },
                    body: JSON.stringify({ imageBase64: base64, gps }),
                  });
                  const json = await res.json();
                  if (myId === analyzeIdRef.current) {
                    const next = (json?.result || null) as Analysis | null;
                    setAnalysis(next);
                    if (next?.title) setTitle(next.title);
                    setStep("result");
                    if (next?.welfareCheck?.attentionNeeded || next?.welfareCheck?.recommendation === "consult_vet") {
                      setShowHealthNotice(true);
                    }
                  }
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
                setStep("analyzing");
                setProgress(0);
                const start = Date.now();
                const duration = 5000;
                const timer = setInterval(() => {
                  const elapsed = Date.now() - start;
                  const pct = Math.min(100, Math.round((elapsed / duration) * 100));
                  setProgress(pct);
                  if (pct >= 100) clearInterval(timer);
                }, 100);
                // Kick off analyze automatically
                try {
                  const myId = ++analyzeIdRef.current;
                  const base64 = await new Promise<string>((resolve, reject) => {
                    const reader = new FileReader();
                    reader.onload = () => {
                      try {
                        const result = reader.result as string;
                        const b64 = result.split(",")[1] || result;
                        resolve(b64);
                      } catch (e) {
                        reject(e);
                      }
                    };
                    reader.onerror = reject;
                    reader.readAsDataURL(file);
                  });
                  const res = await fetch("/api/analyze", {
                    method: "POST",
                    cache: "no-store",
                    headers: { "Content-Type": "application/json", "Cache-Control": "no-store" },
                    body: JSON.stringify({ imageBase64: base64, gps }),
                  });
                  const json = await res.json();
                  if (myId === analyzeIdRef.current) {
                    const next = (json?.result || null) as Analysis | null;
                    setAnalysis(next);
                    if (next?.title) setTitle(next.title);
                    setStep("result");
                    setProgress(100);
                    if (next?.welfareCheck?.attentionNeeded || next?.welfareCheck?.recommendation === "consult_vet") {
                      setShowHealthNotice(true);
                    }
                  }
                } catch {}
              }}
            />
          </div>
        )}

        {step === "analyzing" && (
          <div className="flex flex-col items-center gap-4">
            <LoaderThree />
          </div>
        )}

        {step === "result" && (
          <div className="flex flex-col gap-4">
            <Dialog open={showHealthNotice} onOpenChange={setShowHealthNotice}>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Potential welfare concern</DialogTitle>
                  <DialogDescription>
                    We noticed signs that may indicate this cat needs attention. This is not a medical
                    diagnosis, but a prompt to be cautious and compassionate.
                  </DialogDescription>
                </DialogHeader>
                <div className="text-sm space-y-2">
                  {analysis?.welfareCheck?.indicators?.length ? (
                    <div>
                      <span className="font-medium">What we saw:</span>
                      <ul className="mt-1 list-disc pl-5">
                        {analysis.welfareCheck.indicators.map((it, idx) => (
                          <li key={idx} className="text-muted-foreground">{it.replaceAll("_", " ")}</li>
                        ))}
                      </ul>
                    </div>
                  ) : null}
                  {analysis?.welfareCheck?.recommendation ? (
                    <div>
                      <span className="font-medium">Suggested next step:</span>{" "}
                      <span className="text-muted-foreground">
                        {analysis.welfareCheck.recommendation === "consult_vet"
                          ? "Consult a local veterinarian or animal welfare organization."
                          : analysis.welfareCheck.recommendation === "monitor"
                          ? "Monitor from a safe distance and check again soon."
                          : analysis.welfareCheck.recommendation}
                      </span>
                    </div>
                  ) : null}
                  <p className="text-muted-foreground">
                    Please consider contacting local animal services or a nearby vet for
                    guidance.
                  </p>
                </div>
                <DialogFooter>
                  <Button
                    variant="secondary"
                    onClick={() => window.open("https://www.google.com/search?q=animal+rescue+near+me", "_blank")}
                  >
                    Find local help
                  </Button>
                  <Button onClick={() => setShowHealthNotice(false)}>OK</Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
            {analysis?.isCat === false ? (
              <div className="mx-auto w-full max-w-md">
                <div className="rounded-md border border-red-300 bg-red-50 p-4 text-red-900">
                  <h3 className="mb-1 text-sm font-semibold">Not a cat</h3>
                  <p className="text-sm">{analysis?.sceneDescription || "The uploaded image does not appear to be a cat."}</p>
                </div>
                <div className="mt-4 flex justify-center gap-3">
                  <Button
                    variant="secondary"
                    onClick={() => {
                      analyzeIdRef.current++;
                      if (previewUrl) URL.revokeObjectURL(previewUrl);
                      setSelectedFile(null);
                      setPreviewUrl(null);
                      setAnalysis(null);
                      setTitle("");
                      setStep("select");
                    }}
                  >
                    Try another image
                  </Button>
                  <Button
                    onClick={() => router.push("/discover")}
                  >
                    Explore cats
                  </Button>
                </div>
              </div>
            ) : (
              <>
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
                    classification={{
                      isCat: analysis?.isCat === true,
                      title,
                      breed: analysis?.breed,
                      color: analysis?.color,
                      pattern: analysis?.pattern,
                      bodyType: analysis?.bodyType,
                      eyeColor: analysis?.eyeColor,
                      pose: analysis?.pose,
                      sceneDescription: analysis?.sceneDescription,
                    }}
                    imageUrl={previewUrl}
                    location={location || undefined}
                  />
                </div>
                <div className="flex justify-center gap-3">
                  <Button variant="secondary" onClick={() => setStep("select")}>Back</Button>
                  <Button
                    size="lg"
                    className="h-11 px-6 shadow-lg hover:shadow-xl"
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
                      const walletClient = createWalletClient({ chain: catlasChain, transport: custom(provider) });
                      const contractAddress = process.env.NEXT_PUBLIC_WORLDCAT1155_ADDRESS as `0x${string}`;
                      if (!contractAddress) return;
                      const account = wallets[0].address as `0x${string}`;
                      const hash = await walletClient.writeContract({
                        chain: catlasChain,
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
                          const ev = decodeEventLog({ abi: worldCat1155Abi, data: lg.data, topics: lg.topics }) as { eventName: string; args: { tokenId: bigint } };
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
                          const metadataForDb: Record<string, unknown> = {
                            ...metadata,
                            image: data?.imageCid ? `ipfs://${data.imageCid}` : (metadata as Record<string, unknown>)?.image,
                          };
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
                        const explorerBase = catlasChain?.blockExplorers?.default?.url;
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
                    <Rocket className="mr-2 h-4 w-4" />
                    Publish
                  </Button>
                </div>
              </>
            )}
          </div>
        )}
      </div>
    </section>
  );
}


