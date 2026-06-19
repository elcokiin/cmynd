import { getColor } from 'colorthief'

export async function extractDominantColor(img: HTMLImageElement): Promise<string | null> {
  try {
    const color = await getColor(img)
    if (!color) return null
    return color.hex()
  } catch {
    return null
  }
}

export function applyDominantColor(img: HTMLImageElement): void {
  const apply = async () => {
    const hex = await extractDominantColor(img)
    if (!hex) return
    const figure = img.closest<HTMLElement>('[data-color-thief]')
    if (figure) {
      figure.style.setProperty('--dominant-color', hex)
    }
  }

  if (img.complete && img.naturalWidth > 0) {
    apply()
  } else {
    img.addEventListener('load', apply, { once: true })
  }
}
