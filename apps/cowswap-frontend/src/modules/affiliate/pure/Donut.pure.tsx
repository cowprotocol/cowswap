import type { ReactNode } from 'react'

import * as styledEl from './Donut.styled'

export interface DonutProps {
  value: number
  children: ReactNode
}

const SVG_SIZE = 100
const SVG_CENTER = SVG_SIZE / 2
const STROKE_WIDTH = 14.4
const RADIUS = SVG_CENTER - STROKE_WIDTH / 2
const CENTER_RADIUS = SVG_CENTER - STROKE_WIDTH
const ROUND_CAP_CLOSURE_PERCENT = (STROKE_WIDTH / (2 * Math.PI * RADIUS)) * 100
const MAX_VISIBLE_PROGRESS = 100 - Math.ceil(ROUND_CAP_CLOSURE_PERCENT)
const LAST_INCOMPLETE_PROGRESS = 99
const TAIL_COMPRESSION_START = MAX_VISIBLE_PROGRESS - 4

export function Donut({ value, children }: DonutProps): ReactNode {
  const normalizedValue = Math.min(Math.max(value, 0), 100)
  const renderedValue = getRenderedValue(normalizedValue)
  const isComplete = normalizedValue === 100
  const hasProgress = renderedValue > 0

  return (
    <styledEl.Wrapper>
      <styledEl.Ring viewBox={`0 0 ${SVG_SIZE} ${SVG_SIZE}`} aria-hidden="true">
        <circle
          className="donut-track"
          cx={SVG_CENTER}
          cy={SVG_CENTER}
          r={RADIUS}
          strokeWidth={STROKE_WIDTH}
          pathLength="100"
        />
        {hasProgress && isComplete ? (
          <circle className="donut-progress" cx={SVG_CENTER} cy={SVG_CENTER} r={RADIUS} strokeWidth={STROKE_WIDTH} />
        ) : null}
        {hasProgress && !isComplete ? (
          <circle
            className="donut-progress"
            cx={SVG_CENTER}
            cy={SVG_CENTER}
            r={RADIUS}
            strokeWidth={STROKE_WIDTH}
            strokeDasharray="100"
            strokeDashoffset={100 - renderedValue}
            pathLength="100"
          />
        ) : null}
        <circle className="donut-center" cx={SVG_CENTER} cy={SVG_CENTER} r={CENTER_RADIUS} />
      </styledEl.Ring>
      <styledEl.Content>{children}</styledEl.Content>
    </styledEl.Wrapper>
  )
}

function getRenderedValue(value: number): number {
  if (value <= 0) {
    return 0
  }

  if (value <= TAIL_COMPRESSION_START) {
    return value
  }

  const boundedValue = Math.min(value, LAST_INCOMPLETE_PROGRESS)
  const tailProgress = (boundedValue - TAIL_COMPRESSION_START) / (LAST_INCOMPLETE_PROGRESS - TAIL_COMPRESSION_START)

  // Preserve a visible gap near 100% when using round line caps while keeping tail values distinct.
  return TAIL_COMPRESSION_START + tailProgress * (MAX_VISIBLE_PROGRESS - TAIL_COMPRESSION_START)
}
