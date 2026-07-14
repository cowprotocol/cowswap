import type { ReactNode } from 'react'

import { useAutoFitText } from 'common/hooks/useAutoFitText'

import * as styledEl from './Donut.styled'

export interface DonutProps {
  value: number
  label: ReactNode
  subtitle?: ReactNode
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

export function Donut({ value, label, subtitle }: DonutProps): ReactNode {
  const normalizedValue = Math.min(Math.max(value, 0), 100)
  const renderedValue = getRenderedValue(normalizedValue)
  const isComplete = normalizedValue === 100
  const hasProgress = renderedValue > 0
  const hasSubtitle = shouldRenderSubtitle(subtitle)
  const labelRef = useAutoFitText<HTMLSpanElement>({ min: 14, max: 24, mode: 'single', deps: [label] })
  const subtitleRef = useAutoFitText<HTMLSpanElement>({ min: 11, max: 15, mode: 'single', deps: [subtitle] })

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
      <styledEl.Content>
        <styledEl.ContentInner>
          <styledEl.LabelRow>
            <styledEl.Label ref={labelRef}>{label}</styledEl.Label>
          </styledEl.LabelRow>
          {hasSubtitle ? (
            <styledEl.SubtitleRow>
              <styledEl.Subtitle ref={subtitleRef}>{subtitle}</styledEl.Subtitle>
            </styledEl.SubtitleRow>
          ) : null}
        </styledEl.ContentInner>
      </styledEl.Content>
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

function shouldRenderSubtitle(subtitle: ReactNode): boolean {
  if (subtitle === null || subtitle === undefined || subtitle === '' || typeof subtitle === 'boolean') {
    return false
  }

  if (Array.isArray(subtitle)) {
    return subtitle.some(shouldRenderSubtitle)
  }

  return true
}
