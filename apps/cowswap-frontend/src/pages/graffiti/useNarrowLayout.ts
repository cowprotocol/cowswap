import { useState, type Dispatch, type SetStateAction } from 'react'

import { NARROW_BREAKPOINT_PX } from './wall.constants'

export interface NarrowLayout {
  toolsVisible: boolean
  setToolsVisible: Dispatch<SetStateAction<boolean>>
}

/** Only the initial value depends on the viewport; the phone layout is pure CSS. */
export function useNarrowLayout(): NarrowLayout {
  const [toolsVisible, setToolsVisible] = useState(
    () => typeof window === 'undefined' || window.innerWidth >= NARROW_BREAKPOINT_PX,
  )

  return { toolsVisible, setToolsVisible }
}
