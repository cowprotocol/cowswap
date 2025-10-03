const defaultFrameModule = import.meta.glob<string>('../../assets/animated-favicon/default/*.svg', {
  as: 'raw',
  eager: true,
})

const solvingFrameModules = import.meta.glob<string>('../../assets/animated-favicon/solving/*.svg', {
  as: 'raw',
  eager: true,
})

const completedFrameModules = import.meta.glob<string>('../../assets/animated-favicon/completed/*.svg', {
  as: 'raw',
  eager: true,
})

const backToDefaultFrameModules = import.meta.glob<string>('../../assets/animated-favicon/back-to-default/*.svg', {
  as: 'raw',
  eager: true,
})

function toSortedFrames(modules: Record<string, string>): string[] {
  return Object.entries(modules)
    .sort(([pathA], [pathB]) => pathA.localeCompare(pathB, undefined, { numeric: true }))
    .map(([, source]) => source)
}

const defaultFrames = toSortedFrames(defaultFrameModule)

if (defaultFrames.length !== 1) {
  console.warn('[Favicon] Expected exactly one default frame, found', defaultFrames.length)
}

const SOLVING_FRAME_DURATION_MS = 50
const COMPLETED_FRAME_DURATION_MS = 140
const COMPLETED_HOLD_DURATION_MS = 5000
const BACK_TO_DEFAULT_FRAME_DURATION_MS = 140
const SOLVING_CROSSFADE_STEPS = 4

function svgToDataUri(svg: string): string {
  return `data:image/svg+xml,${encodeURIComponent(svg.trim())}`
}

type ParsedSvg = {
  attributes: string
  body: string
}

const DEFAULT_SVG_ATTRIBUTES = 'xmlns="http://www.w3.org/2000/svg" width="64" height="64" viewBox="0 0 64 64"'

function parseSvg(svg: string): ParsedSvg | null {
  const trimmed = svg.trim()
  const openTagMatch = trimmed.match(/^<svg\b([^>]*)>/i)
  const closeIndex = trimmed.lastIndexOf('</svg>')

  if (!openTagMatch || closeIndex === -1) {
    return null
  }

  const openingTag = openTagMatch[0]
  const attributes = openTagMatch[1]?.trim() ?? ''
  const body = trimmed.slice(openingTag.length, closeIndex).trim()

  return {
    attributes,
    body,
  }
}

function formatOpacity(value: number): string {
  const clamped = Math.min(1, Math.max(0, value))
  return Number(clamped.toFixed(3)).toString()
}

function createCrossfadeSvg(from: ParsedSvg, to: ParsedSvg, progress: number, fallbackAttributes: string): string {
  const attributes = from.attributes || to.attributes || fallbackAttributes || DEFAULT_SVG_ATTRIBUTES
  const fadeOutOpacity = formatOpacity(1 - progress)
  const fadeInOpacity = formatOpacity(progress)

  const fadeOutGroup = fadeOutOpacity === '1' ? from.body : `<g opacity="${fadeOutOpacity}">${from.body}</g>`

  const fadeInGroup = fadeInOpacity === '1' ? to.body : `<g opacity="${fadeInOpacity}">${to.body}</g>`

  return `<svg ${attributes}>${fadeOutGroup}${fadeInGroup}</svg>`
}

function createSmoothLoopFrames(sources: string[], crossfadeSteps: number): string[] {
  if (!sources.length || crossfadeSteps <= 0) {
    return sources.map(svgToDataUri)
  }

  const parsedSources = sources.map(parseSvg)
  const fallbackAttributes = parsedSources.find((parsed) => parsed)?.attributes || DEFAULT_SVG_ATTRIBUTES

  if (parsedSources.some((parsed) => !parsed)) {
    return sources.map(svgToDataUri)
  }

  const frames: string[] = []

  for (let index = 0; index < sources.length; index += 1) {
    frames.push(svgToDataUri(sources[index]))

    const nextIndex = (index + 1) % sources.length
    const from = parsedSources[index] as ParsedSvg
    const to = parsedSources[nextIndex] as ParsedSvg

    for (let step = 1; step <= crossfadeSteps; step += 1) {
      const progress = step / (crossfadeSteps + 1)
      const crossfadeSvg = createCrossfadeSvg(from, to, progress, fallbackAttributes)
      frames.push(svgToDataUri(crossfadeSvg))
    }
  }

  return frames
}

export const defaultFrame = defaultFrames[0] ? svgToDataUri(defaultFrames[0]) : ''
const solvingSources = toSortedFrames(solvingFrameModules)
const solvingLoopSources = solvingSources
export const solvingFrames = solvingLoopSources.length
  ? createSmoothLoopFrames(solvingLoopSources, SOLVING_CROSSFADE_STEPS)
  : [defaultFrame].filter(Boolean)
export const completedFrames = toSortedFrames(completedFrameModules).map(svgToDataUri)
export const completedHoldFrame = completedFrames.length ? completedFrames[completedFrames.length - 1] : defaultFrame
const backToDefaultSources = toSortedFrames(backToDefaultFrameModules)
export const backToDefaultFrames = backToDefaultSources.length
  ? backToDefaultSources.map(svgToDataUri)
  : [defaultFrame].filter(Boolean)

export const frameDurations = {
  solving: SOLVING_FRAME_DURATION_MS,
  completed: COMPLETED_FRAME_DURATION_MS,
  completedHold: COMPLETED_HOLD_DURATION_MS,
  backToDefault: BACK_TO_DEFAULT_FRAME_DURATION_MS,
} as const

const preloadedFrames = new Set<string>()
const retainedImages = new Set<HTMLImageElement>()

function scheduleWarmup(frames: string[]): void {
  if (typeof window === 'undefined' || typeof document === 'undefined' || !frames.length) {
    return
  }

  const uniqueFrames = frames.filter((frame): frame is string => Boolean(frame) && !preloadedFrames.has(frame))

  if (!uniqueFrames.length) {
    return
  }

  const requestIdleCallback = (window as Window & { requestIdleCallback?: (cb: IdleRequestCallback) => number }).requestIdleCallback

  const runner = (): void => {
    uniqueFrames.forEach((frame) => {
      if (preloadedFrames.has(frame)) {
        return
      }

      preloadedFrames.add(frame)

      if (frame.startsWith('data:image')) {
        if (typeof Image === 'undefined') {
          return
        }

        const image = new Image()
        image.decoding = 'async'
        image.src = frame

        const cleanup = (): void => {
          retainedImages.delete(image)
        }

        image.onload = cleanup
        image.onerror = cleanup

        retainedImages.add(image)

        return
      }

      const link = document.createElement('link')
      link.rel = 'preload'
      link.as = 'image'
      link.href = frame
      link.setAttribute('data-animated-favicon-preload', 'true')
      document.head.appendChild(link)
    })
  }

  if (typeof requestIdleCallback === 'function') {
    requestIdleCallback(() => runner())
  } else {
    window.setTimeout(runner, 0)
  }
}

scheduleWarmup([
  defaultFrame,
  completedHoldFrame,
  ...solvingFrames,
  ...completedFrames,
  ...backToDefaultFrames,
])
