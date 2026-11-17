import { pngBlob, preparedSvg } from './artwork.utils'
import { createPackArchive, originalFilename, settingsJson } from './pack.utils'
import { previewSheet } from './previews.utils'
import { LogoSnapshot, LogoPack, ZipEntry } from './solverLogoTool.types'

export async function createLogoPack(snapshot: LogoSnapshot): Promise<LogoPack> {
  await document.fonts.ready
  const { asset, state, artwork, name } = snapshot
  const settings = settingsJson(snapshot, 'logo')
  const entries: ZipEntry[] = [
    { name: 'logo.png', data: await pngBlob(artwork) },
    { name: 'preview.png', data: await pngBlob(previewSheet(artwork, name)) },
    { name: 'original/' + originalFilename(asset), data: asset.bytes },
    { name: 'settings.json', data: settings },
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
  return createPackArchive(name, 'logo', entries)
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
