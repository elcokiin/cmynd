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

function rgbToHsl(r: number, g: number, b: number): [number, number, number] {
  r /= 255; g /= 255; b /= 255
  const max = Math.max(r, g, b), min = Math.min(r, g, b)
  let h = 0, s = 0
  const l = (max + min) / 2
  if (max !== min) {
    const d = max - min
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min)
    switch (max) {
      case r: h = ((g - b) / d + (g < b ? 6 : 0)) / 6; break
      case g: h = ((b - r) / d + 2) / 6; break
      case b: h = ((r - g) / d + 4) / 6; break
    }
  }
  return [h, s, l]
}

function hslToRgb(h: number, s: number, l: number): [number, number, number] {
  let r: number, g: number, b: number
  if (s === 0) {
    r = g = b = l
  } else {
    const hue2rgb = (p: number, q: number, t: number) => {
      if (t < 0) t += 1
      if (t > 1) t -= 1
      if (t < 1/6) return p + (q - p) * 6 * t
      if (t < 1/2) return q
      if (t < 2/3) return p + (q - p) * (2/3 - t) * 6
      return p
    }
    const q = l < 0.5 ? l * (1 + s) : l + s - l * s
    const p = 2 * l - q
    r = hue2rgb(p, q, h + 1/3)
    g = hue2rgb(p, q, h)
    b = hue2rgb(p, q, h - 1/3)
  }
  return [Math.round(r * 255), Math.round(g * 255), Math.round(b * 255)]
}

function lightenColor(hex: string, amount: number = 0.35): string {
  const r = parseInt(hex.slice(1, 3), 16)
  const g = parseInt(hex.slice(3, 5), 16)
  const b = parseInt(hex.slice(5, 7), 16)

  const [h, s, l] = rgbToHsl(r, g, b)

  const targetL = l + (1 - l) * amount * 0.6
  const boostS = s + (1 - s) * 0.4

  const toHex = (c: number) => c.toString(16).padStart(2, '0')
  const [nr, ng, nb] = hslToRgb(h, boostS, targetL)
  return `#${toHex(nr)}${toHex(ng)}${toHex(nb)}`
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
