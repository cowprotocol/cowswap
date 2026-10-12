import { ReactNode } from 'react'

import * as styledEl from './ThreeDots.styled'

export interface ThreeDotsProps {
  /** Use middle dots (···) so lone loading indicators sit optically centered. */
  centered?: boolean
  'aria-label'?: string
}

export function ThreeDots({ centered = false, 'aria-label': ariaLabel }: ThreeDotsProps): ReactNode {
  const dot = centered ? '\u00B7' : '.'

  return (
    <styledEl.ThreeDots
      role={ariaLabel ? 'status' : undefined}
      aria-label={ariaLabel}
      aria-hidden={ariaLabel ? undefined : true}
    >
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
