import { useCallback, useEffect, useState } from 'react'

import type { WallRefs } from './wall.types'

export interface Fullscreen {
  isFullscreen: boolean
  /** Whether this browser can fullscreen an element at all. */
  canFullscreen: boolean
  /** Fullscreen the wall only (like the image export); ESC exits. */
  toggleFullscreen: () => void
}

/**
 * Fullscreen is a capability, not a given: iOS Safari fullscreens nothing but a
 * video, and an embedded frame needs `allow="fullscreen"` from its host.
 */
const canFullscreen = typeof document !== 'undefined' && Boolean(document.fullscreenEnabled)

/** Fullscreen is the clean wall view: nothing overlaid, wall fit to view. */
export function useFullscreen({ wrapElRef }: WallRefs, resetView: () => void): Fullscreen {
  const [isFullscreen, setIsFullscreen] = useState(false)

  useEffect(() => {
    const onChange = (): void => {
      const on = !!document.fullscreenElement

      setIsFullscreen(on)

      if (on) resetView()
    }

    document.addEventListener('fullscreenchange', onChange)

    return () => document.removeEventListener('fullscreenchange', onChange)
  }, [resetView])

  const toggleFullscreen = useCallback((): void => {
    const wrapEl = wrapElRef.current

    if (!wrapEl || !canFullscreen) return

    if (document.fullscreenElement) void document.exitFullscreen()
    else void wrapEl.requestFullscreen().catch(() => undefined)
  }, [wrapElRef])

  return { isFullscreen, canFullscreen, toggleFullscreen }
}
