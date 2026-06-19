export async function copyText(text: string): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(text)
    return true
  } catch {
    return false
  }
}

function loadImageBlob(url: string): Promise<Blob | null> {
  return new Promise((resolve) => {
    const img = new Image()
    img.crossOrigin = 'Anonymous'
    img.onload = () => {
      const canvas = document.createElement('canvas')
      canvas.width = img.naturalWidth
      canvas.height = img.naturalHeight
      const ctx = canvas.getContext('2d')
      if (!ctx) { resolve(null); return }
      ctx.drawImage(img, 0, 0)
      canvas.toBlob((b) => resolve(b), 'image/png', 1.0)
    }
    img.onerror = () => resolve(null)
    img.src = url
  })
}

export async function copyImage(url: string): Promise<boolean> {
  try {
    if (!navigator.clipboard || !window.ClipboardItem) return false
    const blob = await loadImageBlob(url)
    if (!blob) return false
    await navigator.clipboard.write([new ClipboardItem({ 'image/png': blob })])
    return true
  } catch (e) {
    console.error('copyImage error:', e)
    return false
  }
}

export async function downloadImage(url: string, filename = 'imagen.png'): Promise<boolean> {
  try {
    const blob = await loadImageBlob(url)
    if (!blob) return false
    const objectUrl = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = objectUrl
    a.download = filename
    a.click()
    URL.revokeObjectURL(objectUrl)
    return true
  } catch (e) {
    console.error('downloadImage error:', e)
    return false
  }
}
