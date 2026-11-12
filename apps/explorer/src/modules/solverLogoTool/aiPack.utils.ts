import { AI_GUIDELINES, aiPrompt, originalFilename } from './aiHelp.utils'
import { loadArtwork, drawArtwork, pngBlob } from './artwork.utils'
import { createCanvas, getCanvasContext } from './canvas.utils'
import { solverSlug } from './geometry.utils'
import { previewSheet } from './previews.utils'
import { CONTEXT_REFERENCE_URL, SAMPLES } from './solverLogoTool.constants'
import { LogoSnapshot, LogoPack } from './solverLogoTool.types'
import { createZip } from './zip.utils'

export async function createAiPack({ name, asset, state, artwork }: LogoSnapshot): Promise<LogoPack> {
  await document.fonts.ready
  const slug = solverSlug(name),
    prefix = slug + '-ai-help/'
  const [contextReference, spacing, current, preview] = await Promise.all([
    localFile(CONTEXT_REFERENCE_URL),
    positioningGuide(),
    pngBlob(artwork),
    pngBlob(previewSheet(artwork, name)),
  ])
  const settings = {
    version: 1,
    solverName: name,
    source: { name: asset.name, type: asset.type, width: asset.width, height: asset.height },
    output: { width: 1024, height: 1024, background: state.background, squareAsset: true },
    transform: { scalePercent: state.scale, offsetXPercent: state.x, offsetYPercent: state.y },
    preview: {
      basis: 'Proposed design treatments; not production verification',
      actualSizes: { row: 24, winner: 24, stack: 18 },
    },
  }
  const entries = [
    { name: 'original/' + originalFilename(asset), data: asset.bytes },
    { name: 'guidelines.md', data: AI_GUIDELINES },
    { name: 'prompt.txt', data: aiPrompt({ name, asset, state }) },
    { name: 'current-logo.png', data: current },
    { name: 'current-preview.png', data: preview },
    { name: 'current-settings.json', data: JSON.stringify(settings, null, 2) },
    { name: 'examples/context-reference.png', data: contextReference },
    { name: 'examples/positioning-guide.png', data: spacing },
    {
      name: 'README.txt',
      data:
        name +
        ' — AI help pack\n\n' +
        'Attach this ZIP to a new ChatGPT or Claude chat and paste prompt.txt. If ZIP attachments are not supported, unzip it and attach the source, guidelines, current preview and example images separately. File creation depends on the tools available in your chat.\n\n' +
        'original/: your unmodified uploaded artwork. Start here.\n' +
        'guidelines.md: positioning, contrast and output requirements.\n' +
        'examples/: supplied context reference and an illustrated spacing comparison, not artwork to copy.\n' +
        'current-logo.png / current-preview.png: your current editor result, not necessarily a recommended result.\n' +
        'current-settings.json: the source and current adjustments at download time.\n\n' +
        'Check the assistant’s output and send the finished logo pack to your CoW Protocol contact for review. Downloading or using this pack does not update the CMS.\n',
    },
  ]
  return {
    blob: await createZip(entries.map((entry) => ({ ...entry, name: prefix + entry.name }))),
    filename: slug + '-ai-help.zip',
  }
}

async function localFile(path: string): Promise<Blob> {
  const response = await fetch(path)
  if (!response.ok) throw new Error('A visual example could not be loaded. Try again.')
  return response.blob()
}

async function positioningGuide(): Promise<Blob> {
  const file = new File([await localFile(SAMPLES.fibrous.url)], 'fibrous.png', { type: 'image/png' })
  const example = await loadArtwork(file)
  try {
    const canvas = createCanvas(1024, 1024)
    canvas.width = 1200
    canvas.height = 650
    const ctx = getCanvasContext(canvas)
    ctx.fillStyle = '#f3f7fc'
    ctx.fillRect(0, 0, 1200, 650)
    ctx.fillStyle = '#00234e'
    ctx.font = '600 36px Inter, sans-serif'
    ctx.fillText('Give the mark room to breathe', 50, 65)
    ctx.fillStyle = '#4e6685'
    ctx.font = '22px Inter, sans-serif'
    ctx.fillText('Keep its shape. Check the circular crop and the small previews.', 50, 108)
    for (const [i, scale] of [175, 100].entries()) {
      const x = 165 + i * 550,
        y = 165,
        size = 320
      const artwork = createCanvas(1024, 1024)
      artwork.width = artwork.height = 1024
      drawArtwork(artwork, example, { scale, x: 0, y: 0, background: 'transparent' })
      ctx.save()
      ctx.beginPath()
      ctx.arc(x + size / 2, y + size / 2, size / 2, 0, Math.PI * 2)
      ctx.clip()
      ctx.fillStyle = '#fff'
      ctx.fillRect(x, y, size, size)
      ctx.drawImage(artwork, x, y, size, size)
      ctx.restore()
      ctx.fillStyle = '#00234e'
      ctx.font = '600 25px Inter, sans-serif'
      ctx.fillText(i ? 'Comfortable spacing' : 'Crowded / clipped', x, 535)
    }
    ctx.fillStyle = '#4e6685'
    ctx.font = '20px Inter, sans-serif'
    ctx.fillText('Supplied Fibrous logo used as an example. Preserve your own brand artwork.', 50, 610)
    return await pngBlob(canvas)
  } finally {
    example.dispose()
  }
}
