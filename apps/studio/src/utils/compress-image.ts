import imageCompression from "browser-image-compression";

const MAX_FILE_SIZE = 10 * 1024 * 1024;
const MAX_DIMENSION = 1920;
const OUTPUT_QUALITY = 0.8;
const POST_COMPRESSION_LIMIT = 500 * 1024;

export type CompressionResult =
  | { ok: true; file: File }
  | { ok: false; reason: "too-large" | "post-compression-too-large" | "invalid-image" };

export async function compressImage(file: File): Promise<CompressionResult> {
  if (!file.type.startsWith("image/")) {
    return { ok: false, reason: "invalid-image" };
  }

  if (file.size > MAX_FILE_SIZE) {
    return { ok: false, reason: "too-large" };
  }

  try {
    const compressed = await imageCompression(file, {
      maxSizeMB: MAX_FILE_SIZE / (1024 * 1024),
      maxWidthOrHeight: MAX_DIMENSION,
      useWebWorker: true,
      fileType: "image/jpeg",
      initialQuality: OUTPUT_QUALITY,
    });

    if (compressed.size > POST_COMPRESSION_LIMIT) {
      return { ok: false, reason: "post-compression-too-large" };
    }

    return { ok: true, file: compressed };
  } catch {
    return { ok: false, reason: "invalid-image" };
  }
}
