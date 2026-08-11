import { ReactNode } from 'react'

import * as styledEl from './ThreeDots.styled'

/**
 * Animated "..." that always occupies a fixed width (no layout shift / wrap).
 * Word joiners + nowrap keep the dots on one line.
 */
export function ThreeDots(): ReactNode {
  return (
    <styledEl.ThreeDots aria-hidden="true">
      <span>.{'\u2060'}</span>
      <span>.{'\u2060'}</span>
      <span>.</span>
    </styledEl.ThreeDots>
  )
}
