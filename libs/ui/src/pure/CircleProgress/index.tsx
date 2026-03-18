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

const MIN_SIZE = 1

export function CircleProgress({
  isLoading,
  size,
  percent,
  borderWidth,
  backgroundColor,
  borderColor,
  className,
}: CircleProgressProps): ReactNode {
  const safeSize = typeof size === 'number' && size >= MIN_SIZE ? size : MIN_SIZE
  const halfSize = safeSize / 2
  const radius = halfSize - borderWidth

  return (
    <Loader
      $blink={isLoading}
      className={className}
      width={safeSize}
      height={safeSize}
      viewBox={`0 0 ${safeSize} ${safeSize}`}
    >
      <circle cx={halfSize} cy={halfSize} r={radius} fill="none" stroke={backgroundColor} strokeWidth={borderWidth} />
      <circle
        cx={halfSize}
        cy={halfSize}
        r={radius}
        strokeDashoffset={100 - percent}
        fill="none"
        stroke={borderColor}
        strokeWidth={borderWidth}
        pathLength={100}
      />
    </Loader>
  )
}
