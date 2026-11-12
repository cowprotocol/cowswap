import { createCanvas, getCanvasContext } from './canvas.utils'
import { LogoContext, PreviewTheme } from './solverLogoTool.types'

export const PREVIEW_REFERENCE = {
  basis: 'Proposed Figma treatments; not production verification',
  actualSizes: { row: 24, winner: 24, stack: 18 },
  lightPaper: '#ffffff',
  darkPaper: '#18193b',
}
export function drawContext(
  canvas: HTMLCanvasElement,
  artwork: HTMLCanvasElement,
  theme: PreviewTheme,
  kind: LogoContext,
): void {
  const ctx = getCanvasContext(canvas)
  ctx.setTransform(1, 0, 0, 1, 0, 0)
  ctx.clearRect(0, 0, canvas.width, canvas.height)
  ctx.scale(canvas.width / 72, canvas.height / 72)
  const dark = theme === 'dark'
  ctx.fillStyle = dark ? '#18193b' : '#ffffff'
  ctx.fillRect(0, 0, 72, 72)
  if (kind === 'row') {
    ctx.fillStyle = dark ? 'rgba(222,227,230,.02)' : 'rgba(0,35,78,.02)'
    ctx.fillRect(0, 0, 72, 72)
  }
  if (kind === 'winner') {
    ctx.fillStyle = dark ? 'rgba(0,216,151,.15)' : 'rgba(0,123,40,.15)'
    ctx.fillRect(0, 0, 72, 72)
  }
  if (!dark && kind !== 'winner') {
    ctx.strokeStyle = 'rgba(0,35,78,.10)'
    ctx.lineWidth = 1
    ctx.strokeRect(0.5, 0.5, 71, 71)
  }
  const size = kind === 'stack' ? 36 : 48,
    start = (72 - size) / 2
  ctx.save()
  ctx.beginPath()
  ctx.arc(36, 36, size / 2, 0, Math.PI * 2)
  ctx.clip()
  ctx.fillStyle = '#ffffff'
  ctx.fillRect(start, start, size, size)
  ctx.drawImage(artwork, start, start, size, size)
  ctx.restore()
  ctx.beginPath()
  ctx.arc(36, 36, (size - 1) / 2, 0, Math.PI * 2)
  ctx.strokeStyle = dark ? 'rgba(222,227,230,.24)' : 'rgba(0,35,78,.24)'
  ctx.lineWidth = 1
  ctx.stroke()
}
export function previewSheet(artwork: HTMLCanvasElement, name: string): HTMLCanvasElement {
  const canvas = createCanvas(1024, 1024)
  canvas.width = 1600
  canvas.height = 850
  const ctx = getCanvasContext(canvas)
  ctx.fillStyle = '#f3f7fc'
  ctx.fillRect(0, 0, 1600, 850)
  ctx.fillStyle = '#00234e'
  ctx.font = '600 42px Inter, sans-serif'
  ctx.fillText('Solver logo preview', 64, 80)
  ctx.font = '28px Inter, sans-serif'
  ctx.fillText(name.slice(0, 60), 64, 127, 1400)
  ctx.fillStyle = '#4e6685'
  ctx.font = '21px Inter, sans-serif'
  ctx.fillText('Prepared asset', 64, 211)
  ctx.save()
  ctx.beginPath()
  ctx.arc(252, 420, 188, 0, Math.PI * 2)
  ctx.clip()
  ctx.fillStyle = '#ffffff'
  ctx.fillRect(64, 232, 376, 376)
  ctx.drawImage(artwork, 64, 232, 376, 376)
  ctx.restore()
  ;(['row', 'winner', 'stack'] as const).forEach((kind, index) => {
    const x = 660 + index * 270
    ctx.fillStyle = '#00234e'
    ctx.font = '600 24px Inter, sans-serif'
    ctx.fillText(kind[0].toUpperCase() + kind.slice(1), x, 210)
    ctx.fillStyle = '#4e6685'
    ctx.font = '18px Inter, sans-serif'
    ctx.fillText(PREVIEW_REFERENCE.actualSizes[kind] + 'px at actual size', x, 242)
    for (const [j, theme] of (['light', 'dark'] as const).entries()) {
      const tile = createCanvas(1024, 1024)
      tile.width = tile.height = 216
      drawContext(tile, artwork, theme, kind)
      const y = 275 + j * 190
      ctx.fillStyle = '#4e6685'
      ctx.font = '19px Inter, sans-serif'
      if (index === 0) ctx.fillText(theme === 'light' ? 'Light' : 'Dark', 547, y + 77)
      ctx.drawImage(tile, x, y, 144, 144)
    }
  })
  ctx.fillStyle = '#4e6685'
  ctx.font = '19px Inter, sans-serif'
  ctx.fillText('Context previews enlarged 4×. Based on the proposed Figma treatments.', 64, 738)
  ctx.fillText('UI edge rings are preview-only. Share the logo pack with the CoW team for review.', 64, 772)
  return canvas
}
