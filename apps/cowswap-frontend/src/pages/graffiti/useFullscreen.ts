import { useCallback, useEffect, useState } from 'react'

import type { WallRefs } from './wall.types'

export interface Fullscreen {
  isFullscreen: boolean
  /** Fullscreen the wall only (like the image export); ESC exits. */
  toggleFullscreen: () => void
}

/** Fullscreen is the clean wall view: nothing overlaid, wall fit to view. */
export function useFullscreen({ fullscreenRef, wrapElRef }: WallRefs, resetView: () => void): Fullscreen {
  const [isFullscreen, setIsFullscreen] = useState(false)

  useEffect(() => {
    const onChange = (): void => {
      const on = !!document.fullscreenElement

      setIsFullscreen(on)
      fullscreenRef.current = on

      if (on) resetView()
    }

    document.addEventListener('fullscreenchange', onChange)

    return () => document.removeEventListener('fullscreenchange', onChange)
  }, [fullscreenRef, resetView])

  const toggleFullscreen = useCallback((): void => {
    const wrapEl = wrapElRef.current

    if (!wrapEl) return

    if (document.fullscreenElement) void document.exitFullscreen()
    else void wrapEl.requestFullscreen().catch(() => undefined)
  }, [wrapElRef])

  return { isFullscreen, toggleFullscreen }
}
