export async function copyText(text: string): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(text)
    return true
  } catch {
    return false
  }
}

function buildProxyUrl(url: string): string {
  return `/api/cdn-image?url=${encodeURIComponent(url)}`
}

async function loadImageBlob(url: string): Promise<Blob | null> {
  try {
    const res = await fetch(buildProxyUrl(url))
    if (!res.ok) return null
    return await res.blob()
  } catch {
    return null
  }
}

function drawCanvas(
  source: ImageBitmap | HTMLImageElement,
  width: number,
  height: number,
): Promise<Blob | null> {
  return new Promise((resolve) => {
    const canvas = document.createElement('canvas')
    canvas.width = width
    canvas.height = height
    const ctx = canvas.getContext('2d')
    if (!ctx) {
      resolve(null)
      return
    }
    ctx.drawImage(source, 0, 0)
    canvas.toBlob((b) => resolve(b), 'image/png', 1.0)
  })
}

async function blobToPng(blob: Blob): Promise<Blob | null> {
  const objectUrl = URL.createObjectURL(blob)
  try {
    if ('createImageBitmap' in window) {
      const bitmap = await createImageBitmap(blob)
      const png = await drawCanvas(bitmap, bitmap.width, bitmap.height)
      bitmap.close?.()
      return png
    }
  } catch {
    // fall through to <img> decoding
  }

  return new Promise((resolve) => {
    const img = new Image()
    img.onload = () => {
      resolve(drawCanvas(img, img.naturalWidth, img.naturalHeight))
    }
    img.onerror = () => resolve(null)
    img.src = objectUrl
  })
}

export async function copyImage(url: string): Promise<boolean> {
  try {
    if (!navigator.clipboard || !window.ClipboardItem) return false
    const blob = await loadImageBlob(url)
    if (!blob) return false
    const png = await blobToPng(blob)
    if (!png) return false
    await navigator.clipboard.write([new ClipboardItem({ 'image/png': png })])
    return true
  } catch (e) {
    console.error('copyImage error:', e)
    return false
  }
}

function extensionFromType(type: string): string {
  const match = /^image\/(\w+)$/.exec(type)
  if (!match) return 'png'
  const ext = match[1]
  return ext === 'jpeg' ? 'jpg' : ext
}

export async function downloadImage(url: string, baseFilename = 'imagen'): Promise<boolean> {
  try {
    const blob = await loadImageBlob(url)
    if (!blob) return false
    const filename = `${baseFilename}.${extensionFromType(blob.type)}`
    const objectUrl = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = objectUrl
    a.download = filename
    a.click()
    setTimeout(() => URL.revokeObjectURL(objectUrl), 0)
    return true
  } catch (e) {
    console.error('downloadImage error:', e)
    return false
  }
}