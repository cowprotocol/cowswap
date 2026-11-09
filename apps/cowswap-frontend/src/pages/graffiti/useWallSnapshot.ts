import { useLayoutEffect } from 'react'

import type { WallRefs, WallSnapshot } from './wall.types'

/**
 * Publish the committed React state to the canvas layer and draw a frame.
 *
 * A layout effect runs after the commit but before paint, so the loop and the
 * pointer handlers never observe state that is a render behind.
 */
export function useWallSnapshot({ snapshotRef, requestRenderRef }: WallRefs, snapshot: WallSnapshot): void {
  useLayoutEffect(() => {
    snapshotRef.current = snapshot
    requestRenderRef.current()
  }, [requestRenderRef, snapshot, snapshotRef])
}
