import { originalFilename } from './aiHelp.utils'
import { pngBlob, preparedSvg } from './artwork.utils'
import { solverSlug } from './geometry.utils'
import { previewSheet, PREVIEW_REFERENCE } from './previews.utils'
import { LogoSnapshot, LogoPack, ZipEntry } from './solverLogoTool.types'
import { createZip } from './zip.utils'

export async function createLogoPack({ asset, state, artwork, name }: LogoSnapshot): Promise<LogoPack> {
  await document.fonts.ready
  const slug = solverSlug(name)
  const settings = {
    version: 1,
    solverName: name,
    source: { name: asset.name, type: asset.type, width: asset.width, height: asset.height },
    output: { width: 1024, height: 1024, background: state.background, squareAsset: true },
    transform: { scalePercent: state.scale, offsetXPercent: state.x, offsetYPercent: state.y },
    previewReference: PREVIEW_REFERENCE,
    createdAt: new Date().toISOString(),
  }
  const entries: ZipEntry[] = [
    { name: 'logo.png', data: await pngBlob(artwork) },
    { name: 'preview.png', data: await pngBlob(previewSheet(artwork, name)) },
    { name: 'original/' + originalFilename(asset), data: asset.bytes },
    { name: 'settings.json', data: JSON.stringify(settings, null, 2) },
  ]
  const svg = preparedSvg(asset, state)
  if (svg) entries.push({ name: 'logo.svg', data: svg })
  entries.push({
    name: 'README.txt',
    data: `${name} — CoW Swap logo pack

logo.png: 1024 × 1024 square asset, preserving your chosen position and background.
${svg ? 'logo.svg: prepared vector version.' : 'PNG source: no vector SVG has been generated from this bitmap.'}
preview.png: six proposed light/dark contexts, enlarged 4×. This is not proof of production behaviour.
original/: your unmodified uploaded source.
settings.json: the source and editing settings used for this export.

CoW Swap applies a circular crop. The UI edge ring is not baked into the exported artwork.
Share the pack with your CoW Protocol contact for review. This does not publish anything or update the CMS.
`,
  })
  return {
    blob: await createZip(entries.map((entry) => ({ ...entry, name: slug + '/' + entry.name }))),
    filename: slug + '-logo-pack.zip',
  }
}

export function downloadPack({ blob, filename }: LogoPack): void {
  const url = URL.createObjectURL(blob)
  const anchor = document.createElement('a')
  anchor.href = url
  anchor.download = filename
  document.body.append(anchor)
  anchor.click()
  anchor.remove()
  setTimeout(() => URL.revokeObjectURL(url), 30000)
}
