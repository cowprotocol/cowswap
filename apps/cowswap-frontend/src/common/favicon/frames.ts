import completedHoldSvg from 'assets/animated-favicon/shared/completed-hold.svg?raw'
import defaultBaseSvg from 'assets/animated-favicon/shared/default-base.svg?raw'
import defaultDarkBaseSvg from 'assets/animated-favicon/shared/default-dark-base.svg?raw'

const defaultFrameModules = import.meta.glob<string>('../../assets/animated-favicon/default/*.svg', {
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

const completedDarkFrameModules = import.meta.glob<string>('../../assets/animated-favicon/completed-dark/*.svg', {
  as: 'raw',
  eager: true,
})

const backToDefaultFrameModules = import.meta.glob<string>('../../assets/animated-favicon/back-to-default/*.svg', {
  as: 'raw',
  eager: true,
})

const backToDefaultDarkFrameModules = import.meta.glob<string>(
  '../../assets/animated-favicon/back-to-default-dark/*.svg',
  {
    as: 'raw',
    eager: true,
  },
)

function toSortedFrames(modules: Record<string, string>): string[] {
  return Object.entries(modules)
    .sort(([pathA], [pathB]) => pathA.localeCompare(pathB, undefined, { numeric: true }))
    .map(([, source]) => source)
}

function filterModules(
  modules: Record<string, string>,
  predicate: (path: string, source: string) => boolean,
): Record<string, string> {
  return Object.fromEntries(Object.entries(modules).filter(([path, source]) => predicate(path, source)))
}

const defaultBaseSource = defaultBaseSvg.trim()
const defaultDarkBaseSource = defaultDarkBaseSvg.trim()
const moduleDefaultLightSources = toSortedFrames(filterModules(defaultFrameModules, (path) => !path.includes('-dark')))
const defaultLightSources = [
  defaultBaseSource,
  ...moduleDefaultLightSources.filter((source) => source.trim() !== defaultBaseSource),
]
const moduleDefaultDarkSources = toSortedFrames(filterModules(defaultFrameModules, (path) => path.includes('-dark')))
const defaultDarkSources = [
  defaultDarkBaseSource,
  ...moduleDefaultDarkSources.filter((source) => source.trim() !== defaultDarkBaseSource),
]
const solvingSources = toSortedFrames({
  ...solvingFrameModules,
  '../../assets/animated-favicon/solving/solving-6.svg': defaultBaseSource,
})
const completedLightSources = toSortedFrames({
  ...completedFrameModules,
  '../../assets/animated-favicon/completed/completed-1.svg': defaultBaseSource,
})
const completedDarkSources = toSortedFrames({
  ...completedDarkFrameModules,
  '../../assets/animated-favicon/completed-dark/completed-1.svg': defaultDarkBaseSource,
})
const baseBackToDefaultLightSources = toSortedFrames(backToDefaultFrameModules)
const baseBackToDefaultDarkSources = toSortedFrames(backToDefaultDarkFrameModules)
const completedHoldSource = completedHoldSvg.trim()

const fallbackDefaultSources = defaultLightSources.length ? defaultLightSources : defaultDarkSources
const fallbackCompletedSources = completedLightSources.length ? completedLightSources : completedDarkSources

type BackToDefaultSourceOptions = {
  preferredSources: string[]
  fallbackSources: string[]
  holdSource?: string
}

// Ensure the back-to-default animation starts with the completed hold frame without duplicating SVG assets.
function resolveBackToDefaultSources({
  preferredSources,
  fallbackSources,
  holdSource,
}: BackToDefaultSourceOptions): string[] {
  const baseSources = (preferredSources.length ? preferredSources : fallbackSources).map((source) => source.trim())

  if (!baseSources.length) {
    return holdSource ? [holdSource] : baseSources
  }

  if (!holdSource) {
    return baseSources
  }

  if (baseSources[0] === holdSource) {
    return baseSources
  }

  if (baseSources.includes(holdSource)) {
    return baseSources
  }

  return [holdSource, ...baseSources]
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

export type FaviconTheme = 'light' | 'dark'

export type FrameSet = {
  defaultFrame: string
  solvingFrames: string[]
  completedFrames: string[]
  completedHoldFrame: string
  backToDefaultFrames: string[]
}

type FrameSetSources = {
  defaultSources: string[]
  solvingSources: string[]
  completedSources: string[]
  backToDefaultSources: string[]
  completedHoldSource?: string
}

function createFrameSet({
  defaultSources,
  solvingSources,
  completedSources,
  backToDefaultSources,
  completedHoldSource,
}: FrameSetSources): FrameSet {
  const defaultFrame = defaultSources[0] ? svgToDataUri(defaultSources[0]) : ''
  const solvingFrames = solvingSources.length
    ? createSmoothLoopFrames(solvingSources, SOLVING_CROSSFADE_STEPS)
    : [defaultFrame].filter(Boolean)
  const completedFrames = completedSources.map(svgToDataUri)
  const completedHoldFrame = completedHoldSource
    ? svgToDataUri(completedHoldSource)
    : completedFrames.length
      ? completedFrames[completedFrames.length - 1]
      : defaultFrame
  const backToDefaultFrames = backToDefaultSources.length
    ? backToDefaultSources.map(svgToDataUri)
    : [defaultFrame].filter(Boolean)

  return {
    defaultFrame,
    solvingFrames,
    completedFrames,
    completedHoldFrame,
    backToDefaultFrames,
  }
}

const lightFrameSet = createFrameSet({
  defaultSources: defaultLightSources.length ? defaultLightSources : fallbackDefaultSources,
  solvingSources,
  completedSources: completedLightSources.length ? completedLightSources : fallbackCompletedSources,
  backToDefaultSources: resolveBackToDefaultSources({
    preferredSources: baseBackToDefaultLightSources,
    fallbackSources: baseBackToDefaultDarkSources,
    holdSource: completedHoldSource,
  }),
  completedHoldSource,
})

const darkFrameSet = createFrameSet({
  defaultSources: defaultDarkSources.length ? defaultDarkSources : fallbackDefaultSources,
  solvingSources,
  completedSources: completedDarkSources.length ? completedDarkSources : fallbackCompletedSources,
  backToDefaultSources: resolveBackToDefaultSources({
    preferredSources: baseBackToDefaultDarkSources,
    fallbackSources: baseBackToDefaultLightSources,
    holdSource: completedHoldSource,
  }),
  completedHoldSource,
})

const frameSetsByTheme: Record<FaviconTheme, FrameSet> = {
  light: lightFrameSet,
  dark: darkFrameSet,
}

function detectPreferredTheme(): FaviconTheme {
  if (typeof window === 'undefined' || typeof window.matchMedia !== 'function') {
    return 'light'
  }

  try {
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
  } catch (error) {
    console.warn('[Favicon] Failed to evaluate prefers-color-scheme media query', error)
    return 'light'
  }
}

const themeChangeListeners = new Set<(theme: FaviconTheme, frameSet: FrameSet) => void>()

let currentTheme: FaviconTheme = detectPreferredTheme()
let currentFrameSet = frameSetsByTheme[currentTheme]

function notifyThemeChange(theme: FaviconTheme): void {
  const nextFrameSet = frameSetsByTheme[theme]

  if (currentTheme === theme) {
    currentFrameSet = nextFrameSet
    return
  }

  currentTheme = theme
  currentFrameSet = nextFrameSet
  themeChangeListeners.forEach((listener) => listener(theme, nextFrameSet))
}

let isThemeListenerInitialized = false

function ensureThemeListener(): void {
  if (isThemeListenerInitialized) {
    return
  }

  if (typeof window === 'undefined' || typeof window.matchMedia !== 'function') {
    return
  }

  try {
    const matcher = window.matchMedia('(prefers-color-scheme: dark)')
    notifyThemeChange(matcher.matches ? 'dark' : 'light')

    const handleChange = (event: MediaQueryListEvent): void => {
      notifyThemeChange(event.matches ? 'dark' : 'light')
    }

    if (typeof matcher.addEventListener === 'function') {
      matcher.addEventListener('change', handleChange)
    } else if (typeof matcher.addListener === 'function') {
      matcher.addListener(handleChange)
    }

    isThemeListenerInitialized = true
  } catch (error) {
    console.warn('[Favicon] Failed to register prefers-color-scheme listener', error)
  }
}

export function getFrameSet(theme: FaviconTheme): FrameSet {
  return frameSetsByTheme[theme]
}

export function getPreferredTheme(): FaviconTheme {
  return currentTheme
}

export function getCurrentFrameSet(): FrameSet {
  return currentFrameSet
}

export function subscribeToPreferredThemeChanges(
  listener: (theme: FaviconTheme, frameSet: FrameSet) => void,
): () => void {
  themeChangeListeners.add(listener)
  ensureThemeListener()

  return () => {
    themeChangeListeners.delete(listener)
  }
}

export const frameDurations = {
  solving: SOLVING_FRAME_DURATION_MS,
  completed: COMPLETED_FRAME_DURATION_MS,
  completedHold: COMPLETED_HOLD_DURATION_MS,
  backToDefault: BACK_TO_DEFAULT_FRAME_DURATION_MS,
} as const

function gatherFrameSetFrames(frameSet: FrameSet): string[] {
  return [
    frameSet.defaultFrame,
    frameSet.completedHoldFrame,
    ...frameSet.solvingFrames,
    ...frameSet.completedFrames,
    ...frameSet.backToDefaultFrames,
  ]
}

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

  const requestIdleCallback = (window as Window & { requestIdleCallback?: (cb: IdleRequestCallback) => number })
    .requestIdleCallback

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

scheduleWarmup([...gatherFrameSetFrames(lightFrameSet), ...gatherFrameSetFrames(darkFrameSet)])
