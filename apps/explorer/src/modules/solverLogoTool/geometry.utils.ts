import { LogoAsset, LogoTransform, ImageRect } from './solverLogoTool.types'

export const EXPORT_SIZE = 1024
export const MIN_SCALE = 10,
  MAX_SCALE = 800,
  POSITION_LIMIT = MAX_SCALE / 2
export function clamp(value: number | string, min: number, max: number): number {
  return Math.min(max, Math.max(min, Number.isFinite(Number(value)) ? Number(value) : 0))
}
export function clippedFraction(
  asset: Pick<LogoAsset, 'width' | 'height' | 'inkPoints'>,
  state: LogoTransform,
): number {
  const rect = imageRect(asset, state, 1)
  const points = asset.inkPoints || []
  if (!points.length) return 0
  let clipped = 0
  for (const [x, y] of points)
    if (Math.hypot(rect.x + x * rect.width - 0.5, rect.y + y * rect.height - 0.5) > 0.498) clipped++
  return clipped / points.length
}
export function fitMark(
  asset: Pick<LogoAsset, 'width' | 'height' | 'bounds'>,
): Pick<LogoTransform, 'scale' | 'x' | 'y'> {
  const bounds = asset.bounds || { x: 0, y: 0, width: 1, height: 1 }
  const longest = Math.max(asset.width, asset.height)
  const width = (bounds.width * asset.width) / longest
  const height = (bounds.height * asset.height) / longest
  const scale = clamp(76 / Math.hypot(width, height), MIN_SCALE, MAX_SCALE)
  return {
    scale: Math.round(scale),
    x: Math.round(((-(bounds.x + bounds.width / 2 - 0.5) * asset.width) / longest) * scale),
    y: Math.round(((-(bounds.y + bounds.height / 2 - 0.5) * asset.height) / longest) * scale),
  }
}
export function imageRect(
  asset: Pick<LogoAsset, 'width' | 'height'>,
  state: Pick<LogoTransform, 'scale' | 'x' | 'y'>,
  size = EXPORT_SIZE,
): ImageRect {
  const longest = Math.max(asset.width, asset.height)
  const width = (((size * state.scale) / 100) * asset.width) / longest
  const height = (((size * state.scale) / 100) * asset.height) / longest
  return {
    x: size / 2 + (size * state.x) / 100 - width / 2,
    y: size / 2 + (size * state.y) / 100 - height / 2,
    width,
    height,
  }
}
export function solverSlug(name: string): string {
  return (
    name
      .toLowerCase()
      .normalize('NFKD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '')
      .slice(0, 60) || 'solver'
  )
}
