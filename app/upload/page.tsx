"use client";

import { useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { CatNftCard } from "@/components/nft/CatNftCard";
import { ImageCropper } from "@/components/upload/Cropper";
import exifr from "exifr";
import { compressToJpegSquare } from "@/lib/image/process";
import { Progress } from "@/components/ui/progress";

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
              <CatNftCard
                classification={analysis || { isCat: false }}
                imageUrl={previewUrl}
                location={location || undefined}
              />
            </div>
            <div className="flex gap-3">
              <Button onClick={() => setStep("select")}>Back</Button>
              <Button
                variant="secondary"
                onClick={() => {
                  setSelectedFile(null);
                  if (previewUrl) URL.revokeObjectURL(previewUrl);
                  setPreviewUrl(null);
                  setAnalysis(null);
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


