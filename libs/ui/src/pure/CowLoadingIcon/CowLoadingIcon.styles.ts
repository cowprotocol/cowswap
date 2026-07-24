import styled, { keyframes } from 'styled-components/macro'

export const VIEWBOX_SIZE = 44
export const HEAD_OFFSET_X = 4
export const HEAD_OFFSET_Y = 10
export const EYE_RADIUS = 2.4

export const eyeJump = keyframes`
  0%, 10% {
    transform: translateY(0);
  }
  20% {
    transform: translateY(-0.9px);
  }
  30% {
    transform: translateY(-1.9px);
  }
  38% {
    transform: translateY(-2.5px);
  }
  44% {
    transform: translateY(-2.7px);
  }
  52% {
    transform: translateY(-1.7px);
  }
  60% {
    transform: translateY(-0.8px);
  }
  68% {
    transform: translateY(0.35px);
  }
  76% {
    transform: translateY(-0.2px);
  }
  86% {
    transform: translateY(0.1px);
  }
  94%, 100% {
    transform: translateY(0);
  }
`

export const Svg = styled.svg<{ $size: number }>`
  width: ${({ $size }) => `${$size}px`};
  height: ${({ $size }) => `${$size}px`};
  display: block;
`

export const Background = styled.rect.attrs({ x: 0, y: 0, width: VIEWBOX_SIZE, height: VIEWBOX_SIZE, rx: 12 })<{
  $fill: string
}>`
  fill: ${({ $fill }) => $fill};
`

export const Head = styled.path.attrs({ transform: `translate(${HEAD_OFFSET_X} ${HEAD_OFFSET_Y})` })<{
  $fill: string
}>`
  fill: ${({ $fill }) => $fill};
`

export const Eye = styled.circle<{ $delay?: number; $fill: string }>`
  fill: ${({ $fill }) => $fill};
  animation-name: ${eyeJump};
  animation-duration: 1s;
  animation-iteration-count: infinite;
  animation-delay: ${({ $delay }) => `${$delay ?? 0}ms`};
  animation-timing-function: cubic-bezier(0.25, 0.15, 0.25, 1);
  transform-origin: center;
  transform-box: fill-box;
  will-change: transform;

  @media (prefers-reduced-motion: reduce) {
    animation: none;
  }
`
