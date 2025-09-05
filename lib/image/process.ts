import imageCompression from "browser-image-compression";

export async function compressToJpegSquare(blob: Blob, maxSize = 1024): Promise<Blob> {
  const file = new File([blob], "image.jpg", { type: "image/jpeg" });
  const compressed = await imageCompression(file, {
    maxWidthOrHeight: maxSize,
    initialQuality: 0.9,
    fileType: "image/jpeg",
    useWebWorker: true,
  });
  return compressed;
}


