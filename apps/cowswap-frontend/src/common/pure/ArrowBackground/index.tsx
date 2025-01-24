import { forwardRef, useMemo } from 'react'
import { memo } from 'react'

import { UI } from '@cowprotocol/ui'

import styled from 'styled-components/macro'

const ArrowBackgroundWrapper = styled.div<{ $maxOpacity: number }>`
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  pointer-events: none;
  visibility: hidden;
  opacity: 0;
  transition: opacity 1s ease-in-out;

  &.visible {
    visibility: visible;
  }

  &.show {
    opacity: ${({ $maxOpacity }) => $maxOpacity};
  }
`

const MIN_FONT_SIZE = 18
const MAX_FONT_SIZE = 42

const Arrow = styled.div<{ delay: number; color: string; fontSize: number }>`
  position: absolute;
  font-size: ${({ fontSize }) => fontSize}px;
  color: ${({ color }) => color};
  animation: float 2s infinite linear;
  animation-delay: ${({ delay }) => delay}s;
  opacity: 0;

  @keyframes float {
    0% {
      transform: translateY(100%);
      opacity: 0;
    }
    10% {
      transform: translateY(80%);
      opacity: 0.3;
    }
    50% {
      transform: translateY(0);
      opacity: 0.3;
    }
    90% {
      transform: translateY(-80%);
      opacity: 0.2;
    }
    100% {
      transform: translateY(-100%);
      opacity: 0;
    }
  }
`

export interface ArrowBackgroundProps {
  count?: number
  color?: string
  className?: string
  maxOpacity?: number
}

export const ArrowBackground = memo(
  forwardRef<HTMLDivElement, ArrowBackgroundProps>(
    ({ count = 36, color = `var(${UI.COLOR_COWAMM_LIGHT_GREEN})`, className = '', maxOpacity = 0.25 }, ref) => {
      const arrows = useMemo(() => {
        return Array.from({ length: count }, (_, index) => ({
          delay: (index / count) * 4,
          left: `${Math.random() * 100}%`,
          top: `${Math.random() * 100}%`,
          fontSize: Math.floor(Math.random() * (MAX_FONT_SIZE - MIN_FONT_SIZE + 1)) + MIN_FONT_SIZE,
        }))
      }, [count])

      return (
        <ArrowBackgroundWrapper ref={ref} className={className} $maxOpacity={maxOpacity}>
          {arrows.map((arrow, index) => (
            <Arrow
              key={index}
              delay={arrow.delay}
              color={color}
              fontSize={arrow.fontSize}
              style={{
                left: arrow.left,
                top: arrow.top,
              }}
            >
              ↑
            </Arrow>
          ))}
        </ArrowBackgroundWrapper>
      )
    },
  ),
)
