import { ReactNode } from 'react'

import * as styledEl from './ThreeDots.styled'

export interface ThreeDotsProps {
  /** Use middle dots (···) so lone loading indicators sit optically centered. */
  centered?: boolean
}

export function ThreeDots({ centered = false }: ThreeDotsProps): ReactNode {
  const dot = centered ? '\u00B7' : '.'

  return (
    <styledEl.ThreeDots aria-hidden="true">
      <span>
        {dot}
        {'\u2060'}
      </span>
      <span>
        {dot}
        {'\u2060'}
      </span>
      <span>{dot}</span>
    </styledEl.ThreeDots>
  )
}
