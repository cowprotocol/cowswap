import { useEffect } from 'react'

import { CANVAS } from './raster.utils'
import { renderWall } from './renderWall.utils'

import type { WallRefs } from './wall.types'

/**
 * Run the wall's requestAnimationFrame loop for the page's lifetime. Everything
 * it draws comes through refs, so changes to tools or colours never tear it down.
 */
export function useWallRenderLoop(refs: WallRefs): void {
  const { offscreenRef } = refs

  useEffect(() => {
    const offscreen = document.createElement('canvas')

    offscreen.width = CANVAS.w
    offscreen.height = CANVAS.h
    offscreenRef.current = offscreen

    let running = true

    const frame = (): void => {
      if (!running) return

      renderWall(refs)
      requestAnimationFrame(frame)
    }

    requestAnimationFrame(frame)

    return () => {
      running = false
    }
  }, [offscreenRef, refs])
}
