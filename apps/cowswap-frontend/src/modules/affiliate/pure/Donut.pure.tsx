import type { ReactNode } from 'react'

import * as styledEl from './Donut.styled'

export interface DonutProps {
  value: number
  children: ReactNode
}

export function Donut({ value, children }: DonutProps): ReactNode {
  const hasProgress = value > 0

  return (
    <styledEl.Wrapper $value={value}>
      <styledEl.Ring viewBox="0 0 100 100" aria-hidden="true">
        <circle className="donut-track" cx="50" cy="50" r="var(--radius)" pathLength="100" />
        {hasProgress ? <circle className="donut-progress" cx="50" cy="50" r="var(--radius)" pathLength="100" /> : null}
        <circle className="donut-center" cx="50" cy="50" r="calc(50 - var(--stroke-width))" />
      </styledEl.Ring>
      <styledEl.Content>{children}</styledEl.Content>
    </styledEl.Wrapper>
  )
}
