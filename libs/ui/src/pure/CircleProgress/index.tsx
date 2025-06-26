import { ReactNode } from 'react'

import styled from 'styled-components/macro'

const Loader = styled.svg`
  transform: rotate(-90deg);

  circle:nth-child(2) {
    stroke-dasharray: 100;
    transition: stroke-dashoffset 1s;
  }
`

interface CircleProgressProps {
  percent: number
  size: number
  borderWidth: number
  backgroundColor: string
  borderColor: string
  className?: string
}

export function CircleProgress({
  size,
  percent,
  borderWidth,
  backgroundColor,
  borderColor,
  className,
}: CircleProgressProps): ReactNode {
  const halfSize = size / 2
  const radius = halfSize - borderWidth

  return (
    <Loader className={className} width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
      <circle cx={halfSize} cy={halfSize} r={radius} fill="none" stroke={backgroundColor} stroke-width={borderWidth} />
      <circle
        cx={halfSize}
        cy={halfSize}
        r={radius}
        stroke-dashoffset={100 - percent}
        fill="none"
        stroke={borderColor}
        stroke-width={borderWidth}
        pathLength="100"
      />
    </Loader>
  )
}
