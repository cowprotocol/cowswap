import { DependencyList, RefObject, useLayoutEffect, useRef, useState } from 'react'

export interface AutoFitTextResult<T extends HTMLElement = HTMLElement> {
  ref: RefObject<T | null>
  isFitted: boolean
}

interface AutoFitOptions {
  min?: number
  max?: number
  step?: number
  mode?: FitMode
  deps?: DependencyList
}

type FitMode = 'single' | 'multi'

const EMPTY_DEPS: DependencyList = []

interface FitConfig {
  node: HTMLElement
  parent: HTMLElement
  minBound: number
  maxBound: number
  stepSize: number
  whiteSpace: 'nowrap' | 'normal'
}

interface NormalizedOptions {
  minBound: number
  maxBound: number
  stepSize: number
  shouldWarn: boolean
}

/**
 * Lightweight auto-fit hook to scale text so it fits its parent box.
 * It uses binary search over font sizes and ResizeObserver to re-apply on layout changes.
 * `isFitted` flips true after the first successful fit (useful for blur/opacity reveals).
 */
export function useAutoFitText<T extends HTMLElement = HTMLElement>(
  options: AutoFitOptions = {},
): AutoFitTextResult<T> {
  const { min = 12, max = 48, step = 1, mode = 'multi', deps = EMPTY_DEPS } = options
  const ref = useRef<T | null>(null)
  const [isFitted, setIsFitted] = useState(false)
  const hasFittedRef = useRef(false)
  // Value-stable key so inline `deps: [content]` arrays do not retrigger the effect every render.
  const depsKey = deps.map(String).join('\0')

  useLayoutEffect(() => {
    const { minBound, maxBound, stepSize, shouldWarn } = normalizeOptions(min, max, step)

    const node = ref.current
    const parent = node?.parentElement
    if (!node || !parent) return

    if (shouldWarn) {
      console.warn('useAutoFitText: normalizing invalid options', { min, max, step })
    }

    const whiteSpace = mode === 'single' ? 'nowrap' : 'normal'

    hasFittedRef.current = false
    setIsFitted(false)

    const rafRef = { id: 0 }
    const teardowns: Array<() => void> = []
    const scheduleFit = (): void => {
      cancelAnimationFrame(rafRef.id)
      rafRef.id = requestAnimationFrame(() => {
        fitText({ node, parent, minBound, maxBound, stepSize, whiteSpace })

        if (!hasFittedRef.current) {
          hasFittedRef.current = true
          setIsFitted(true)
        }
      })
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
  }, [depsKey, max, min, mode, step])

  return { ref, isFitted }
}

function fitText({ node, parent, minBound, maxBound, stepSize, whiteSpace }: FitConfig): void {
  const setSize = (val: number): void => {
    node.style.fontSize = `${val}px`
    node.style.whiteSpace = whiteSpace
  }

  const fits = (): boolean => {
    // Width: scroll vs parent content box (slot wrappers keep padding out of the measure).
    // Height: skip for nowrap — a content-sized parent matches the child, so scrollHeight
    // often reads 1px larger and the search collapses to min.
    if (node.scrollWidth > parent.clientWidth) {
      return false
    }

    if (whiteSpace === 'nowrap') {
      return true
    }

    return node.scrollHeight <= parent.clientHeight
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
