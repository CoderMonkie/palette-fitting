// 原型 index.html 中颜色函数的逐行翻译，逻辑保持一致。
export interface RGB { r: number; g: number; b: number }
export interface HSV { h: number; s: number; v: number }

export function hexToRgb(hex: string): RGB {
  let h = hex.replace('#', '')
  if (h.length === 3) h = h[0] + h[0] + h[1] + h[1] + h[2] + h[2]
  return {
    r: parseInt(h.slice(0, 2), 16),
    g: parseInt(h.slice(2, 4), 16),
    b: parseInt(h.slice(4, 6), 16),
  }
}

export function rgbToHex(r: number, g: number, b: number): string {
  const c = (v: number): string => ('0' + Math.max(0, Math.min(255, Math.round(v))).toString(16)).slice(-2).toUpperCase()
  return '#' + c(r) + c(g) + c(b)
}

export function rgbToHsv(r: number, g: number, b: number): HSV {
  r /= 255; g /= 255; b /= 255
  const max = Math.max(r, g, b), min = Math.min(r, g, b), d = max - min
  let h = 0
  const s = max === 0 ? 0 : d / max, v = max
  if (d !== 0) {
    if (max === r) h = 60 * (((g - b) / d) % 6)
    else if (max === g) h = 60 * ((b - r) / d + 2)
    else h = 60 * ((r - g) / d + 4)
    if (h < 0) h += 360
  }
  return { h, s, v }
}

export function hsvToRgb(h: number, s: number, v: number): RGB {
  const c = v * s, x = c * (1 - Math.abs((h / 60) % 2 - 1)), m = v - c
  let r = 0, g = 0, b = 0
  if (h < 60) { r = c; g = x }
  else if (h < 120) { r = x; g = c }
  else if (h < 180) { g = c; b = x }
  else if (h < 240) { g = x; b = c }
  else if (h < 300) { r = x; b = c }
  else { r = c; b = x }
  return { r: (r + m) * 255, g: (g + m) * 255, b: (b + m) * 255 }
}

export function luminance(hex: string): number {
  const o = hexToRgb(hex)
  const a = [o.r / 255, o.g / 255, o.b / 255].map((v) =>
    v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4))
  return 0.2126 * a[0] + 0.7152 * a[1] + 0.0722 * a[2]
}

export function ratio(a: string, b: string): number {
  const la = luminance(a), lb = luminance(b)
  return (Math.max(la, lb) + 0.05) / (Math.min(la, lb) + 0.05)
}

export function onColor(hex: string): string {
  return ratio(hex, '#FFFFFF') >= ratio(hex, '#000000') ? '#FFFFFF' : '#000000'
}
