import {
  PointerEvent as ReactPointerEvent,
  RefObject,
  useCallback,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
} from 'react'

import { DRAWER_WIDTH_CSS_VAR } from '../styled'

const DEFAULT_DRAWER_WIDTH = 320
const MIN_DRAWER_WIDTH = 380
const MAX_DRAWER_WIDTH = 720
const MIN_PREVIEW_WIDTH = 360

function getViewportWidth(): number {
  return typeof window === 'undefined' ? Number.POSITIVE_INFINITY : window.innerWidth
}

export function clampDrawerWidth(nextWidth: number, viewportWidth = getViewportWidth()): number {
  const maxAllowedWidth = Math.max(MIN_DRAWER_WIDTH, Math.min(MAX_DRAWER_WIDTH, viewportWidth - MIN_PREVIEW_WIDTH))

  return Math.min(Math.max(nextWidth, MIN_DRAWER_WIDTH), maxAllowedWidth)
}

interface UseResizableDrawerWidthResult {
  drawerWidth: number
  isResizing: boolean
  handleResizeStart: (event: ReactPointerEvent<HTMLDivElement>) => void
}

function setDrawerWidthCssVar(container: HTMLElement | null, width: number): void {
  if (!container) return

  container.style.setProperty(DRAWER_WIDTH_CSS_VAR, `${width}px`)
}

// eslint-disable-next-line max-lines-per-function
export function useResizableDrawerWidth(containerRef: RefObject<HTMLElement | null>): UseResizableDrawerWidthResult {
  const resizeStateRef = useRef<{ startX: number; startWidth: number } | null>(null)
  const [drawerWidth, setDrawerWidth] = useState(() => clampDrawerWidth(DEFAULT_DRAWER_WIDTH))
  const [isResizing, setIsResizing] = useState(false)
  const currentWidthRef = useRef(drawerWidth)
  const animationFrameRef = useRef<number | null>(null)

  const stopResizing = useCallback((): void => {
    resizeStateRef.current = null
    setIsResizing(false)
    document.body.style.cursor = ''
    document.body.style.userSelect = ''
  }, [])

  const applyDrawerWidth = useCallback(
    (nextWidth: number): void => {
      const clampedWidth = clampDrawerWidth(nextWidth)

      currentWidthRef.current = clampedWidth
      setDrawerWidthCssVar(containerRef.current, clampedWidth)
    },
    [containerRef],
  )

  useLayoutEffect(() => {
    currentWidthRef.current = drawerWidth
    setDrawerWidthCssVar(containerRef.current, drawerWidth)
  }, [containerRef, drawerWidth])

  useEffect(() => {
    const handlePointerMove = (event: PointerEvent): void => {
      const resizeState = resizeStateRef.current

      if (!resizeState) return

      const deltaX = event.clientX - resizeState.startX
      const nextWidth = clampDrawerWidth(resizeState.startWidth + deltaX)

      if (animationFrameRef.current !== null) {
        cancelAnimationFrame(animationFrameRef.current)
      }

      animationFrameRef.current = window.requestAnimationFrame(() => {
        applyDrawerWidth(nextWidth)
        animationFrameRef.current = null
      })
    }

    const handlePointerUp = (): void => {
      setDrawerWidth(currentWidthRef.current)
      stopResizing()
    }

    const handleWindowResize = (): void => {
      const nextWidth = clampDrawerWidth(currentWidthRef.current)

      applyDrawerWidth(nextWidth)
      setDrawerWidth(nextWidth)
    }

    window.addEventListener('pointermove', handlePointerMove)
    window.addEventListener('pointerup', handlePointerUp)
    window.addEventListener('resize', handleWindowResize)

    return () => {
      window.removeEventListener('pointermove', handlePointerMove)
      window.removeEventListener('pointerup', handlePointerUp)
      window.removeEventListener('resize', handleWindowResize)

      if (animationFrameRef.current !== null) {
        cancelAnimationFrame(animationFrameRef.current)
      }

      stopResizing()
    }
  }, [applyDrawerWidth, stopResizing])

  const handleResizeStart = useCallback(
    (event: ReactPointerEvent<HTMLDivElement>): void => {
      if (event.button !== 0) return

      resizeStateRef.current = {
        startX: event.clientX,
        startWidth: drawerWidth,
      }

      setIsResizing(true)
      document.body.style.cursor = 'col-resize'
      document.body.style.userSelect = 'none'
      event.currentTarget.setPointerCapture(event.pointerId)
      event.preventDefault()
    },
    [drawerWidth],
  )

  return {
    drawerWidth,
    isResizing,
    handleResizeStart,
  }
}
