import { useEffect, useState, type Dispatch, type SetStateAction } from 'react'

import { NARROW_BREAKPOINT_PX } from './wall.constants'

export interface NarrowLayout {
  narrow: boolean
  toolsVisible: boolean
  setToolsVisible: Dispatch<SetStateAction<boolean>>
}

const NARROW_QUERY = `(max-width: ${NARROW_BREAKPOINT_PX}px)`

/** Phone layout: the tools become a bottom sheet and start hidden. */
export function useNarrowLayout(): NarrowLayout {
  const [narrow, setNarrow] = useState(isNarrowViewport)
  const [toolsVisible, setToolsVisible] = useState(() => !isNarrowViewport())

  useEffect(() => {
    const mq = window.matchMedia(NARROW_QUERY)
    const onChange = (e: MediaQueryListEvent): void => setNarrow(e.matches)

    setNarrow(mq.matches)
    mq.addEventListener('change', onChange)

    return () => mq.removeEventListener('change', onChange)
  }, [])

  return { narrow, toolsVisible, setToolsVisible }
}

function isNarrowViewport(): boolean {
  return typeof window !== 'undefined' && window.innerWidth < NARROW_BREAKPOINT_PX
}
