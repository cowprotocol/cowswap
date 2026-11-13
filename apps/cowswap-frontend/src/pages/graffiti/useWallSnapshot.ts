import { useLayoutEffect } from 'react'

import type { WallRefs, WallSnapshot } from './wall.types'

/** A layout effect, so the canvas layer never observes state a render behind. */
export function useWallSnapshot({ snapshotRef, requestRenderRef }: WallRefs, snapshot: WallSnapshot): void {
  useLayoutEffect(() => {
    snapshotRef.current = snapshot
    requestRenderRef.current()
  }, [requestRenderRef, snapshot, snapshotRef])
}
