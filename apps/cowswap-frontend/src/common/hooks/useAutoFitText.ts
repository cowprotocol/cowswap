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

/**
 * Lightweight auto-fit hook to scale text so it fits its parent box.
 * It uses binary search over font sizes and ResizeObserver to re-apply on layout changes.
 */
export function useAutoFitText<T extends HTMLElement = HTMLElement>(options: AutoFitOptions = {}): RefObject<T | null> {
  const { min = 12, max = 48, step = 1, mode = 'multi', deps = EMPTY_DEPS } = options
  const ref = useRef<T | null>(null)

  useLayoutEffect(() => {
    const node = ref.current
    const parent = node?.parentElement
    if (!node || !parent) return

    const stepSize = step > 0 ? step : 1
    const whiteSpace = mode === 'single' ? 'nowrap' : 'normal'
    const setSize = (val: number): void => {
      node.style.fontSize = `${val}px`
      node.style.whiteSpace = whiteSpace
    }

    const fits = (): boolean => {
      const { width, height } = node.getBoundingClientRect()
      const { width: pWidth, height: pHeight } = parent.getBoundingClientRect()
      return width <= pWidth && height <= pHeight
    }

    const applyFit = (): void => {
      let low = min
      let high = max
      let best = min

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
      const clamped = Math.max(min, Math.min(quantized, best, max))
      setSize(clamped)
    }

    const rafRef = { id: 0 }
    const teardowns: Array<() => void> = []
    const scheduleFit = (): void => {
      cancelAnimationFrame(rafRef.id)
      rafRef.id = requestAnimationFrame(() => {
        applyFit()
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
  }, [deps, max, min, mode, step])

  return ref
}
