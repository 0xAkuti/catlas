"use client"

import { AlertCircleIcon, ImageUpIcon, XIcon } from "lucide-react"
import { useRef } from "react"

import { useFileUpload } from "@/hooks/use-file-upload"

export default function Component({ onSelected, maxSizeMB = 5 }: { onSelected?: (file: File, preview: string) => void; maxSizeMB?: number }) {
  const maxSize = maxSizeMB * 1024 * 1024 // 5MB default

  const [
    { files, isDragging, errors },
    {
      handleDragEnter,
      handleDragLeave,
      handleDragOver,
      handleDrop,
      openFileDialog,
      removeFile,
      getInputProps,
      addFiles,
    },
  ] = useFileUpload({
    accept: "image/*",
    maxSize,
    onFilesAdded: (added) => {
      const first = added?.[0]
      if (!first) return
      if (first.file instanceof File) {
        const preview = first.preview || URL.createObjectURL(first.file)
        onSelected?.(first.file, preview)
      }
    },
  })

  const previewUrl = files[0]?.preview || null
  const fileInputRef = useRef<HTMLInputElement>(null)
  const isAndroid = typeof navigator !== "undefined" && /Android/i.test(navigator.userAgent)
  const suppressNextOpenRef = useRef(false)

  return (
    <div className="flex flex-col gap-2">
      <div className="relative">
        {/* Drop area (click opens image picker / photo picker) */}
        <div
          role="button"
          onClick={() => { if (!suppressNextOpenRef.current) openFileDialog(); }}
          onDragEnter={handleDragEnter}
          onDragLeave={handleDragLeave}
          onDragOver={handleDragOver}
          onDrop={handleDrop}
          data-dragging={isDragging || undefined}
          className="border-input hover:bg-accent/50 data-[dragging=true]:bg-accent/50 has-[input:focus]:border-ring has-[input:focus]:ring-ring/50 relative flex min-h-52 flex-col items-center justify-center overflow-hidden rounded-xl border border-dashed p-4 transition-colors has-disabled:pointer-events-none has-disabled:opacity-50 has-[img]:border-none has-[input:focus]:ring-[3px]"
        >
          <input
            {...getInputProps()}
            className="sr-only"
            aria-label="Upload file"
          />
          <input
            ref={fileInputRef}
            type="file"
            // Use broad accept to force Android file manager; hook will validate image/*
            accept="*/*"
            className="sr-only"
            aria-label="Choose file"
            onChange={(e) => {
              if (e.target.files && e.target.files.length > 0) {
                addFiles(e.target.files)
                e.currentTarget.value = ""
              }
            }}
          />
          {previewUrl ? (
            <div className="absolute inset-0">
              <img
                src={previewUrl}
                alt={files[0]?.file?.name || "Uploaded image"}
                className="size-full object-cover"
              />
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center px-4 py-3 text-center">
              <div
                className="bg-background mb-2 flex size-11 shrink-0 items-center justify-center rounded-full border"
                aria-hidden="true"
              >
                <ImageUpIcon className="size-4 opacity-60" />
              </div>
              <p className="mb-1.5 text-sm font-medium">
                Drop your image here or click to browse
              </p>
              <p className="text-muted-foreground text-xs">
                Max size: {maxSizeMB}MB
              </p>
            </div>
          )}
        </div>
        {previewUrl && (
          <div className="absolute top-4 right-4">
            <button
              type="button"
              className="focus-visible:border-ring focus-visible:ring-ring/50 z-50 flex size-8 cursor-pointer items-center justify-center rounded-full bg-black/60 text-white transition-[color,box-shadow] outline-none hover:bg-black/80 focus-visible:ring-[3px]"
              onClick={() => removeFile(files[0]?.id)}
              aria-label="Remove image"
            >
              <XIcon className="size-4" aria-hidden="true" />
            </button>
          </div>
        )}
      </div>

      {errors.length > 0 && (
        <div
          className="text-destructive flex items-center gap-1 text-xs"
          role="alert"
        >
          <AlertCircleIcon className="size-3 shrink-0" />
          <span>{errors[0]}</span>
        </div>
      )}
      {isAndroid && (
        <div className="mt-2 flex items-center justify-center">
          <button
            type="button"
            className="inline-flex items-center gap-2 rounded-md border px-3 py-2 text-sm"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              suppressNextOpenRef.current = true;
              fileInputRef.current?.click();
              setTimeout(() => { suppressNextOpenRef.current = false; }, 0);
            }}
          >
            <ImageUpIcon className="size-4" />
            Choose file
          </button>
        </div>
      )}
    </div>
  )
}
