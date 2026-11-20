import { EXPORT_SIZE, solverSlug } from './geometry.utils'
import { PREVIEW_REFERENCE } from './previews.utils'
import { LogoAsset, LogoPack, LogoSnapshot, ZipEntry } from './solverLogoTool.types'
import { createZip } from './zip.utils'

export async function createPackArchive(name: string, kind: 'logo' | 'ai', entries: ZipEntry[]): Promise<LogoPack> {
  const slug = solverSlug(name),
    directory = kind === 'ai' ? `${slug}-ai-help` : slug
  return {
    blob: await createZip(entries.map((entry) => ({ ...entry, name: `${directory}/${entry.name}` }))),
    filename: `${slug}-${kind === 'ai' ? 'ai-help' : 'logo-pack'}.zip`,
  }
}

export function originalFilename(asset: Pick<LogoAsset, 'name' | 'type'>): string {
  return (
    asset.name
      .replace(/[^a-zA-Z0-9._-]/g, '-')
      .replace(/^\.+/, '')
      .slice(0, 100) || 'source.' + asset.type
  )
}

export function settingsJson({ name, asset, state }: LogoSnapshot, kind: 'logo' | 'ai'): string {
  const settings = {
    version: 1,
    solverName: name,
    source: { name: asset.name, type: asset.type, width: asset.width, height: asset.height },
    output: { width: EXPORT_SIZE, height: EXPORT_SIZE, background: state.background, squareAsset: true },
    transform: { scalePercent: state.scale, offsetXPercent: state.x, offsetYPercent: state.y },
    ...(kind === 'ai'
      ? {
          preview: {
            basis: 'Proposed design treatments; not production verification',
            actualSizes: PREVIEW_REFERENCE.actualSizes,
          },
        }
      : { previewReference: PREVIEW_REFERENCE, createdAt: new Date().toISOString() }),
  }
  return JSON.stringify(settings, null, 2)
}
