export async function getImageDimensions(src: string): Promise<{ width: number; height: number } | null> {
  try {
    const res = await fetch(`/api/cdn-image?url=${encodeURIComponent(src)}`)
    if (!res.ok) return null
    const blob = await res.blob()
    const bitmap = await createImageBitmap(blob)
    return { width: bitmap.width, height: bitmap.height }
  } catch {
    return null
  }
}