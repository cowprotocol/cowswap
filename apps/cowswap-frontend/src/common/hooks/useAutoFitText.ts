import { DependencyList, RefObject, useLayoutEffect, useRef } from 'react'

type FitMode = 'single' | 'multi'

interface AutoFitOptions {
  min?: number
  max?: number
  step?: number
  mode?: FitMode
  deps?: DependencyList
}

const EMPTY_DEPS: DependencyList = []

interface NormalizedOptions {
  minBound: number
  maxBound: number
  stepSize: number
  shouldWarn: boolean
}

interface FitConfig {
  node: HTMLElement
  parent: HTMLElement
  minBound: number
  maxBound: number
  stepSize: number
  whiteSpace: 'nowrap' | 'normal'
}

function normalizeOptions(min: number, max: number, step: number): NormalizedOptions {
  const stepSize = step > 0 ? step : 1
  const swappedBounds = min > max

  return {
    minBound: swappedBounds ? max : min,
    maxBound: swappedBounds ? min : max,
    stepSize,
    shouldWarn: swappedBounds || stepSize !== step,
  }
}

function fitText({ node, parent, minBound, maxBound, stepSize, whiteSpace }: FitConfig): void {
  const setSize = (val: number): void => {
    node.style.fontSize = `${val}px`
    node.style.whiteSpace = whiteSpace
  }

  const fits = (): boolean => {
    const { width, height } = node.getBoundingClientRect()
    const { width: pWidth, height: pHeight } = parent.getBoundingClientRect()
    return width <= pWidth && height <= pHeight
  }

  let low = minBound
  let high = maxBound
  let best = minBound

  while (low <= high) {
    const mid = Math.floor((low + high) / 2)
    setSize(mid)

    if (fits()) {
      best = mid
      low = mid + 1
    } else {
      high = mid - 1
    }
  }

  // Quantize downward so we never exceed the measured best-fit size
  const quantized = Math.floor(best / stepSize) * stepSize
  const clamped = Math.max(minBound, Math.min(quantized, best, maxBound))
  setSize(clamped)
}

/**
 * Lightweight auto-fit hook to scale text so it fits its parent box.
 * It uses binary search over font sizes and ResizeObserver to re-apply on layout changes.
 */
export function useAutoFitText<T extends HTMLElement = HTMLElement>(options: AutoFitOptions = {}): RefObject<T | null> {
  const { min = 12, max = 48, step = 1, mode = 'multi', deps = EMPTY_DEPS } = options
  const ref = useRef<T | null>(null)

  useLayoutEffect(() => {
    const { minBound, maxBound, stepSize, shouldWarn } = normalizeOptions(min, max, step)

    const node = ref.current
    const parent = node?.parentElement
    if (!node || !parent) return

    if (shouldWarn) {
      // Warn rather than throw so callers see the misconfiguration without breaking rendering
      console.warn('useAutoFitText: normalizing invalid options', { min, max, step })
    }

    const whiteSpace = mode === 'single' ? 'nowrap' : 'normal'

    const rafRef = { id: 0 }
    const teardowns: Array<() => void> = []
    const scheduleFit = (): void => {
      cancelAnimationFrame(rafRef.id)
      rafRef.id = requestAnimationFrame(() => fitText({ node, parent, minBound, maxBound, stepSize, whiteSpace }))
    }

    scheduleFit()

    if (typeof ResizeObserver !== 'undefined') {
      const ro = new ResizeObserver(scheduleFit)
      ro.observe(parent)
      ro.observe(node)
      teardowns.push(() => ro.disconnect())
    } else {
      const handler = (): void => scheduleFit()
      window.addEventListener('resize', handler)
      teardowns.push(() => window.removeEventListener('resize', handler))
    }

    return () => {
      cancelAnimationFrame(rafRef.id)
      teardowns.forEach((fn) => fn())
    }
  }, [deps, max, min, mode, step])

  return ref
}
