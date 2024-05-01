import styled, { keyframes } from 'styled-components'
import { lighten } from 'polished'
import { Color } from 'styles/variables'

export const loadingAnimation = keyframes`
  0% {
    background-position: 100% 50%;
  }
  100% {
    background-position: 0% 50%;
  }
`

/* Loading state bubbles (animation style from: src/components/Loader/styled.tsx) */
export const LoadingBubble = styled.div<{
  height?: string
  width?: string
  round?: boolean
  delay?: string
  margin?: string
}>`
  border-radius: 12px;
  border-radius: ${({ round }) => (round ? '50%' : '12px')};
  ${({ margin }) => margin && `margin: ${margin}`};
  height: ${({ height }) => height ?? '24px'};
  width: 50%;
  width: ${({ width }) => width ?? '50%'};
  animation: ${loadingAnimation} 1.5s infinite;
  ${({ delay }) => delay && `animation-delay: ${delay};`}
  animation-fill-mode: both;
  background: linear-gradient(
    to left,
    ${Color.darkBlue} 25%,
    ${lighten(0.075, Color.darkBlue)} 50%,
    ${Color.darkBlue} 75%
  );
  will-change: background-position;
  background-size: 400%;
`
