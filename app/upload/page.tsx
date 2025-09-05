"use client";

import { useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { CatNftCard } from "@/components/nft/CatNftCard";

type UploadStep = "select" | "analyzing" | "result";

export default function UploadPage() {
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [step, setStep] = useState<UploadStep>("select");
  const [analysis, setAnalysis] = useState<any | null>(null);

  return (
    <section className="py-8">
      <h2 className="text-xl font-semibold">Upload</h2>
      <p className="mt-2 text-sm text-muted-foreground">
        Upload a photo or capture one. We’ll extract GPS if available.
      </p>

      <div className="mt-6">
        {step === "select" && (
          <div className="flex flex-col gap-4">
            <div>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                capture="environment"
                onChange={(e) => {
                  const file = e.target.files?.[0] || null;
                  setSelectedFile(file);
                  if (previewUrl) URL.revokeObjectURL(previewUrl);
                  setPreviewUrl(file ? URL.createObjectURL(file) : null);
                }}
              />
              {selectedFile && (
                <p className="mt-2 text-xs text-muted-foreground">
                  Selected: {selectedFile.name}
                </p>
              )}
            </div>

            {previewUrl && (
              <div className="rounded-lg border overflow-hidden">
                {/* Placeholder for future square crop UI */}
                <img
                  src={previewUrl}
                  alt="Selected preview"
                  className="w-full h-auto max-h-[360px] object-contain bg-muted"
                />
              </div>
            )}

            <div className="flex gap-3">
              <Button
                disabled={!selectedFile}
                onClick={async () => {
                  if (!selectedFile) return;
                  setStep("analyzing");
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
                    body: JSON.stringify({ imageBase64: base64 }),
                  });
                  const json = await res.json();
                  setAnalysis(json?.result || null);
                  setStep("result");
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
                }}
              >
                Clear
              </Button>
            </div>
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
            <CatNftCard classification={analysis || { isCat: false }} imageUrl={previewUrl} />
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


