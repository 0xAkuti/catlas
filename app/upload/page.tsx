"use client";

import { useRef, useState } from "react";

export default function UploadPage() {
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [selectedFileName, setSelectedFileName] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysis, setAnalysis] = useState<any | null>(null);

  return (
    <section className="py-8">
      <h2 className="text-xl font-semibold">Upload</h2>
      <p className="mt-2 text-sm text-muted-foreground">
        Upload a photo or capture one. We’ll extract GPS if available.
      </p>

      <div className="mt-6 flex flex-col gap-4">
        <div>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            capture="environment"
            onChange={(e) => {
              const file = e.target.files?.[0];
              setSelectedFileName(file ? file.name : null);
            }}
          />
          {selectedFileName && (
            <p className="mt-2 text-xs text-muted-foreground">
              Selected: {selectedFileName}
            </p>
          )}
        </div>

        <button
          className="inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 disabled:opacity-50 disabled:pointer-events-none bg-primary text-primary-foreground shadow hover:bg-primary/90 h-9 px-4 py-2"
          disabled={isAnalyzing}
          onClick={async () => {
            const file = fileInputRef.current?.files?.[0];
            if (!file) return;
            setIsAnalyzing(true);
            setAnalysis(null);
            const buffer = await file.arrayBuffer();
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
            setIsAnalyzing(false);
          }}
        >
          {isAnalyzing ? "Analyzing..." : "Analyze"}
        </button>

        <div className="rounded-lg border min-h-40 bg-muted/20 p-4 text-xs whitespace-pre-wrap">
          {analysis ? JSON.stringify(analysis, null, 2) : "Results will appear here."}
        </div>
      </div>
    </section>
  );
}


