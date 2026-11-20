import { normalizeError } from '@cowprotocol/common-utils'

import { getCanvasContext } from './canvas.utils'
import { imageRect } from './geometry.utils'
import { analyseInk } from './ink.utils'
import { LogoAsset, LogoTransform } from './solverLogoTool.types'
import { readSvg, SafeSvg } from './svg.utils'

const SVG_NS = 'http://www.w3.org/2000/svg'

export function drawArtwork(canvas: HTMLCanvasElement, asset: LogoAsset, state: LogoTransform): void {
  const ctx = getCanvasContext(canvas)
  ctx.clearRect(0, 0, canvas.width, canvas.height)
  if (state.background !== 'transparent') {
    ctx.fillStyle = state.background
    ctx.fillRect(0, 0, canvas.width, canvas.height)
  }
  const rect = imageRect(asset, state, canvas.width)
  ctx.imageSmoothingEnabled = true
  ctx.imageSmoothingQuality = 'high'
  ctx.drawImage(asset.image, rect.x, rect.y, rect.width, rect.height)
}

export async function loadArtwork(file: File): Promise<LogoAsset> {
  const { bytes, type, svg } = await readSource(file)
  const blob = svg ? new Blob([svg.text], { type: 'image/svg+xml' }) : new Blob([bytes], { type: 'image/png' })
  const url = URL.createObjectURL(blob),
    image = new Image()
  try {
    image.src = url
    await image.decode()
    if (!image.naturalWidth || !image.naturalHeight || Math.max(image.naturalWidth, image.naturalHeight) > 16384)
      throw new Error('Use an image between 1 and 16384 pixels on each side.')
    const dimensions = svg ?? { width: image.naturalWidth, height: image.naturalHeight }
    return {
      name: file.name,
      bytes,
      type,
      svg: svg ? svg.text : null,
      image,
      url,
      width: dimensions.width,
      height: dimensions.height,
      ...analyseInk(image),
      dispose(): void {
        URL.revokeObjectURL(url)
      },
    }
  } catch (err: unknown) {
    const error = normalizeError(err)
    URL.revokeObjectURL(url)
    if (error instanceof DOMException)
      throw new Error('The image could not be decoded. Try exporting a fresh PNG or SVG.')
    throw error
  }
}

export function pngBlob(canvas: HTMLCanvasElement): Promise<Blob> {
  return new Promise((resolve, reject) =>
    canvas.toBlob((blob) => (blob ? resolve(blob) : reject(new Error('The PNG could not be exported.'))), 'image/png'),
  )
}

export function preparedSvg(asset: LogoAsset, state: LogoTransform): string | null {
  if (!asset.svg) return null
  const root = new DOMParser().parseFromString(asset.svg, 'image/svg+xml').documentElement
  const rect = imageRect(asset, state)
  for (const [property, value] of Object.entries(rect)) {
    root.setAttribute(property, String(value))
    root.style.setProperty(property, `${value}px`, 'important')
  }
  root.setAttribute('preserveAspectRatio', 'xMidYMid meet')
  const background =
    state.background === 'transparent' ? '' : '<rect width="1024" height="1024" fill="' + state.background + '"/>'
  return (
    '<svg xmlns="' +
    SVG_NS +
    '" width="1024" height="1024" viewBox="0 0 1024 1024">' +
    background +
    new XMLSerializer().serializeToString(root) +
    '</svg>'
  )
}

async function readSource(
  file: File,
): Promise<{ bytes: Uint8Array<ArrayBuffer>; type: 'svg' | 'png'; svg: SafeSvg | null }> {
  if (!file.size) throw new Error('That file is empty. Choose a PNG or SVG.')
  if (file.size > 10 * 1024 * 1024) throw new Error('Choose a PNG or SVG smaller than 10 MB.')
  const bytes = new Uint8Array(await file.arrayBuffer())
  if (/\.svg$/i.test(file.name) || file.type === 'image/svg+xml')
    return { bytes, type: 'svg', svg: readSvg(new TextDecoder().decode(bytes)) }
  if ([137, 80, 78, 71, 13, 10, 26, 10].every((value, i) => bytes[i] === value))
    return { bytes, type: 'png', svg: null }
  throw new Error('Choose a PNG or SVG logo. Other file formats are not supported.')
}
