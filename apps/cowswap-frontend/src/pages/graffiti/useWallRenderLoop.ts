import { useEffect } from 'react'

import { CANVAS } from './raster.utils'
import { needsContinuousRender, renderWall } from './renderWall.utils'

import type { WallRefs } from './wall.types'

/**
 * Draw the wall on demand.
 *
 * Rendering is scheduled by `requestRenderRef`, which every mutation calls, so
 * an idle wall schedules no animation frames at all. The only continuously
 * animated element is the dashed outline of an unplaced frame, which keeps
 * asking for the next frame while it is on screen.
 */
export function useWallRenderLoop(refs: WallRefs): void {
  const { offscreenRef, requestRenderRef, snapshotRef } = refs

  useEffect(() => {
    const offscreen = document.createElement('canvas')

    offscreen.width = CANVAS.w
    offscreen.height = CANVAS.h
    offscreenRef.current = offscreen

    let frameId = 0
    let disposed = false

    const schedule = (): void => {
      if (frameId || disposed) return

      frameId = requestAnimationFrame(() => {
        frameId = 0

        if (disposed) return

        renderWall(refs)

        if (needsContinuousRender(snapshotRef.current)) schedule()
      })
    }

    requestRenderRef.current = schedule
    schedule()

    return () => {
      disposed = true

      if (frameId) cancelAnimationFrame(frameId)

      requestRenderRef.current = () => undefined
    }
  }, [offscreenRef, refs, requestRenderRef, snapshotRef])
}
