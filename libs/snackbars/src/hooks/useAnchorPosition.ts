import { useLayoutEffect, useState } from 'react'

export function useAnchorPosition(elementId: string | undefined): { top: number; height: number } {
  const [top, setOffsetTop] = useState(0)
  const [height, setOffsetHeight] = useState(0)

  useLayoutEffect(() => {
    if (!elementId) return

    const updatePosition = (): void => {
      requestAnimationFrame(() => {
        const element = document.getElementById(elementId)

        if (element) {
          const { top, height } = element.getBoundingClientRect()
          setOffsetTop(top)
          setOffsetHeight(height)
        } else {
          setTimeout(updatePosition, 100)
        }
      })
    }

    updatePosition()

    const resizeObserver = new ResizeObserver(updatePosition)
    resizeObserver.observe(document.body)

    window.addEventListener('scroll', updatePosition)

    return () => {
      window.removeEventListener('scroll', updatePosition)
      resizeObserver.disconnect()
    }
  }, [elementId])

  return { top, height }
}
