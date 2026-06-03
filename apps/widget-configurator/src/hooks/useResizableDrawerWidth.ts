import React, { RefObject, useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react'

import { useLocalStorageState } from '@cowprotocol/common-hooks'

import { CONFIGURATOR_SIDEBAR_WIDTH_STORAGE_KEY } from '../configurator.constants'

const MIN_DRAWER_WIDTH = 380
const DEFAULT_DRAWER_WIDTH = MIN_DRAWER_WIDTH
const MIN_PREVIEW_WIDTH = 240

function getViewportWidth(): number {
  return typeof window === 'undefined' ? Number.POSITIVE_INFINITY : window.innerWidth
}

export function clampDrawerWidth(nextWidth: number, viewportWidth = getViewportWidth()): number {
  const maxAllowedWidth = Math.max(0, viewportWidth - MIN_PREVIEW_WIDTH)
  const minAllowedWidth = Math.min(MIN_DRAWER_WIDTH, maxAllowedWidth)

  return Math.min(Math.max(nextWidth, minAllowedWidth), maxAllowedWidth)
}

interface UseResizableDrawerWidthResult {
  drawerWidth: number
  isResizing: boolean
  handleResizeStart: (event: React.PointerEvent<HTMLDivElement>) => void
}

function setDrawerWidthCssVar(container: HTMLElement | null, cssVarName: string, width: number): void {
  if (!container) return

  container.style.setProperty(cssVarName, `${width}px`)
}

function resolveDrawerWidth(persistedValue: unknown): number {
  const nextWidth =
    typeof persistedValue === 'number' && Number.isFinite(persistedValue) ? persistedValue : DEFAULT_DRAWER_WIDTH

  return clampDrawerWidth(nextWidth)
}

// eslint-disable-next-line max-lines-per-function
export function useResizableDrawerWidth(
  containerRef: RefObject<HTMLElement | null>,
  cssVarName: string,
): UseResizableDrawerWidthResult {
  const resizeStateRef = useRef<{ startX: number; startWidth: number } | null>(null)
  const [drawerWidth, setDrawerWidth] = useLocalStorageState(CONFIGURATOR_SIDEBAR_WIDTH_STORAGE_KEY, resolveDrawerWidth)
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
      setDrawerWidthCssVar(containerRef.current, cssVarName, clampedWidth)
    },
    [containerRef, cssVarName],
  )

  useLayoutEffect(() => {
    currentWidthRef.current = drawerWidth
    setDrawerWidthCssVar(containerRef.current, cssVarName, drawerWidth)
  }, [containerRef, cssVarName, drawerWidth])

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
  }, [applyDrawerWidth, setDrawerWidth, stopResizing])

  const handleResizeStart = useCallback(
    (event: React.PointerEvent<HTMLDivElement>): void => {
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
