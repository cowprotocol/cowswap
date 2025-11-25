import { DependencyList, RefObject, useLayoutEffect, useMemo, useRef } from 'react'

type FitMode = 'single' | 'multi'

interface AutoFitOptions {
  min?: number
  max?: number
  step?: number
  mode?: FitMode
  deps?: DependencyList
}

/**
 * Lightweight auto-fit hook to scale text so it fits its parent box.
 * It uses binary search over font sizes and ResizeObserver to re-apply on layout changes.
 */
export function useAutoFitText<T extends HTMLElement = HTMLElement>(options: AutoFitOptions = {}): RefObject<T | null> {
  const { min = 12, max = 48, step = 1, mode = 'multi', deps = [] } = options
  const ref = useRef<T | null>(null)
  const depsKey = useMemo(() => deps, [deps])

  useLayoutEffect(() => {
    const node = ref.current
    const parent = node?.parentElement
    if (!node || !parent) return

    const setSize = (val: number): void => {
      node.style.fontSize = `${val}px`
      node.style.whiteSpace = mode === 'single' ? 'nowrap' : 'normal'
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
          low = mid + step
        } else {
          high = mid - step
        }
      }

      setSize(Math.max(min, Math.min(best, max)))
    }

    const rafRef = { id: 0 }
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
      return () => {
        cancelAnimationFrame(rafRef.id)
        ro.disconnect()
      }
    }

    const handler = (): void => scheduleFit()
    window.addEventListener('resize', handler)
    return () => {
      cancelAnimationFrame(rafRef.id)
      window.removeEventListener('resize', handler)
    }
    // depsKey is a stable array for spread; hook lint wants literal arrays
  }, [depsKey, max, min, mode, step])

  return ref
}
