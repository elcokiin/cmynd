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

function lightenColor(hex: string, amount: number = 0.35): string {
  const r = parseInt(hex.slice(1, 3), 16)
  const g = parseInt(hex.slice(3, 5), 16)
  const b = parseInt(hex.slice(5, 7), 16)

  const lum = (0.2126 * (r / 255) + 0.7152 * (g / 255) + 0.0722 * (b / 255))
  if (lum > 0.6) return hex

  const blend = (c: number) => Math.round(c + (255 - c) * amount)
  const toHex = (c: number) => c.toString(16).padStart(2, '0')
  return `#${toHex(blend(r))}${toHex(blend(g))}${toHex(blend(b))}`
}

export function applyDominantColor(img: HTMLImageElement): void {
  const apply = async () => {
    const hex = await extractDominantColor(img)
    if (!hex) return
    const lightHex = lightenColor(hex)
    const figure = img.closest<HTMLElement>('[data-color-thief]')
    if (figure) {
      figure.style.setProperty('--dominant-color', lightHex)
    }
  }

  if (img.complete && img.naturalWidth > 0) {
    apply()
  } else {
    img.addEventListener('load', apply, { once: true })
  }
}
