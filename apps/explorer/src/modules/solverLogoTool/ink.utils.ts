import { createCanvas, getCanvasContext } from './canvas.utils'
import { LogoAsset } from './solverLogoTool.types'

type Rgb = [number, number, number]

export function analyseInk(image: HTMLImageElement): Pick<LogoAsset, 'inkPoints' | 'bounds'> {
  const longest = Math.max(image.naturalWidth, image.naturalHeight)
  const canvas = createCanvas(
    Math.max(1, Math.round((256 * image.naturalWidth) / longest)),
    Math.max(1, Math.round((256 * image.naturalHeight) / longest)),
  )
  const ctx = getCanvasContext(canvas, true)
  ctx.drawImage(image, 0, 0, canvas.width, canvas.height)
  const pixels = ctx.getImageData(0, 0, canvas.width, canvas.height)
  const background = detectBackground(pixels)
  const points: [number, number][] = []
  let minX = 1,
    minY = 1,
    maxX = 0,
    maxY = 0
  for (let y = 0; y < canvas.height; y += 2)
    for (let x = 0; x < canvas.width; x += 2) {
      const index = (y * canvas.width + x) * 4
      if (!isForeground(pixels.data, index, background)) continue
      const px = (x + 0.5) / canvas.width,
        py = (y + 0.5) / canvas.height
      points.push([px, py])
      minX = Math.min(minX, px)
      maxX = Math.max(maxX, px)
      minY = Math.min(minY, py)
      maxY = Math.max(maxY, py)
    }
  if (!points.length) return { inkPoints: [], bounds: { x: 0, y: 0, width: 1, height: 1 } }
  return {
    inkPoints: points,
    bounds: { x: minX, y: minY, width: maxX - minX + 2 / canvas.width, height: maxY - minY + 2 / canvas.height },
  }
}

function backgroundSamples({ data, width, height }: ImageData): Rgb[] {
  const samples: Rgb[] = []
  for (const [x, y] of [
    [0.5, 0.03],
    [0.5, 0.97],
    [0.03, 0.5],
    [0.97, 0.5],
    [0.03, 0.03],
    [0.97, 0.03],
    [0.03, 0.97],
    [0.97, 0.97],
  ]) {
    const i = (Math.floor(y * (height - 1)) * width + Math.floor(x * (width - 1))) * 4
    if (data[i + 3] > 128) samples.push([data[i], data[i + 1], data[i + 2]])
  }
  return samples
}

function detectBackground(pixels: ImageData): Rgb | null {
  let opaque = 0
  for (let i = 3; i < pixels.data.length; i += 4) if (pixels.data[i] > 128) opaque++
  if (opaque / (pixels.width * pixels.height) <= 0.7) return null
  const samples = backgroundSamples(pixels)
  for (const candidate of samples) {
    const similar = samples.filter((color) => Math.hypot(...color.map((value, i) => value - candidate[i])) < 28)
    if (similar.length >= 3 && similar.length / samples.length >= 0.7) return candidate
  }
  return null
}

function isForeground(data: Uint8ClampedArray, index: number, background: Rgb | null): boolean {
  if (data[index + 3] < 48) return false
  return (
    !background ||
    Math.hypot(data[index] - background[0], data[index + 1] - background[1], data[index + 2] - background[2]) >= 35
  )
}
