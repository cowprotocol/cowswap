import { useState, type Dispatch, type SetStateAction } from 'react'

import { NARROW_BREAKPOINT_PX } from './wall.constants'

export interface NarrowLayout {
  toolsVisible: boolean
  setToolsVisible: Dispatch<SetStateAction<boolean>>
}

/**
 * Whether the tool sidebar starts open.
 *
 * Only the initial value depends on the viewport — the sidebar's phone layout
 * (a bottom sheet) is pure CSS in wall.styled, so nothing here needs to track
 * resizes.
 */
export function useNarrowLayout(): NarrowLayout {
  const [toolsVisible, setToolsVisible] = useState(
    () => typeof window === 'undefined' || window.innerWidth >= NARROW_BREAKPOINT_PX,
  )

  return { toolsVisible, setToolsVisible }
}
