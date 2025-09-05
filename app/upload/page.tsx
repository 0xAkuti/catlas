"use client";

import { useRef, useState } from "react";

export default function UploadPage() {
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [selectedFileName, setSelectedFileName] = useState<string | null>(null);

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

        <div className="rounded-lg border h-64 bg-muted/20" />
      </div>
    </section>
  );
}


