import { ReactNode } from 'react'

import styled from 'styled-components/macro'

const Loader = styled.svg<{ $blink: boolean }>`
  transform: rotate(-90deg);

  circle:nth-child(2) {
    stroke-dasharray: 100;
    transition: stroke-dashoffset 1s;
  }

  animation: ${({ $blink }) => ($blink ? `blink 0.75s infinite` : 'none')};

  @keyframes blink {
    0% {
      opacity: 1;
    }
    50% {
      opacity: 0.5;
    }
    100% {
      opacity: 1;
    }
  }
`

interface CircleProgressProps {
  isLoading: boolean
  percent: number
  size: number
  borderWidth: number
  backgroundColor: string
  borderColor: string
  className?: string
}

export function CircleProgress({
  isLoading,
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
    <Loader $blink={isLoading} className={className} width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
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
