import { useLayoutEffect, useState } from 'react'

export function useAnchorPosition(elementId: string | undefined): { top: number; height: number } {
  const [top, setOffsetTop] = useState(0)
  const [height, setOffsetHeight] = useState(0)

  useLayoutEffect(() => {
    if (!elementId) return

    let rafId: number | null = null
    let retryTimeoutId: number | null = null

    const updatePosition = (): void => {
      if (rafId !== null) return

      rafId = requestAnimationFrame(() => {
        rafId = null

        const element = document.getElementById(elementId)

        if (element) {
          const { top, height } = element.getBoundingClientRect()
          setOffsetTop(top)
          setOffsetHeight(height)

          if (retryTimeoutId !== null) {
            clearTimeout(retryTimeoutId)
            retryTimeoutId = null
          }

          return
        }

        if (retryTimeoutId === null) {
          retryTimeoutId = window.setTimeout(() => {
            retryTimeoutId = null
            updatePosition()
          }, 100)
        }
      })
    }

    updatePosition()

    const resizeObserver = new ResizeObserver(updatePosition)
    resizeObserver.observe(document.body)

    window.addEventListener('scroll', updatePosition)

    return () => {
      if (retryTimeoutId) {
        clearTimeout(retryTimeoutId)
      }
      window.removeEventListener('scroll', updatePosition)
      resizeObserver.disconnect()
    }
  }, [elementId])

  return { top, height }
}
