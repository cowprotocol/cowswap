import { ReactNode } from 'react'

import { UI } from '@cowprotocol/ui'

import styled, { keyframes } from 'styled-components/macro'

const VIEWBOX_SIZE = 44
const HEAD_OFFSET_X = 4
const HEAD_OFFSET_Y = 10
const EYE_RADIUS = 2.4

const eyeJump = keyframes`
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

const Svg = styled.svg<{ $size: number }>`
  width: ${({ $size }) => `${$size}px`};
  height: ${({ $size }) => `${$size}px`};
  display: block;
`

const Background = styled.rect.attrs({ x: 0, y: 0, width: VIEWBOX_SIZE, height: VIEWBOX_SIZE, rx: 12 })<{
  $fill: string
}>`
  fill: ${({ $fill }) => $fill};
`

const Head = styled.path.attrs({ transform: `translate(${HEAD_OFFSET_X} ${HEAD_OFFSET_Y})` })<{
  $fill: string
}>`
  fill: ${({ $fill }) => $fill};
`

const Eye = styled.circle<{ $delay?: number; $fill: string }>`
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

export interface CowLoadingIconProps {
  size?: number
  className?: string
  isDarkMode?: boolean
}

export function CowLoadingIcon({ size = 36, className, isDarkMode = false }: CowLoadingIconProps = {}): ReactNode {
  const palette = isDarkMode
    ? {
        background: `var(${UI.COLOR_PAPER_DARKER})`,
        head: `var(${UI.COLOR_TEXT})`,
        eyes: `var(${UI.COLOR_PAPER_DARKER})`,
      }
    : {
        background: `var(${UI.COLOR_BLUE_900_PRIMARY})`,
        head: `var(${UI.COLOR_PAPER})`,
        eyes: `var(${UI.COLOR_BLUE_900_PRIMARY})`,
      }

  return (
    <Svg
      viewBox={`0 0 ${VIEWBOX_SIZE} ${VIEWBOX_SIZE}`}
      xmlns="http://www.w3.org/2000/svg"
      focusable="false"
      aria-hidden="true"
      className={className}
      $size={size}
    >
      <Background $fill={palette.background} />
      <Head
        fillRule="evenodd"
        clipRule="evenodd"
        d="M13.653 24C12.802 24.0009 11.9729 23.731 11.2854 23.2294C10.598 22.7279 10.0879 22.0206 9.829 21.21L7.11 12.666H5.44C4.58874 12.667 3.75924 12.3971 3.07158 11.8953C2.38392 11.3936 1.87377 10.686 1.615 9.875L0 4.8H6.058L2.863 0H33.137L29.942 4.8H36L34.385 9.876C34.126 10.6868 33.6158 11.3942 32.9282 11.8957C32.2405 12.3973 31.4111 12.6671 30.56 12.666H28.89L26.17 21.21C25.9111 22.0206 25.401 22.7279 24.7136 23.2294C24.0261 23.731 23.197 24.0009 22.346 24H13.653Z"
        $fill={palette.head}
      />
      <Eye cx={13.756 + HEAD_OFFSET_X} cy={10.333 + HEAD_OFFSET_Y} r={EYE_RADIUS} $delay={0} $fill={palette.eyes} />
      <Eye cx={22.244 + HEAD_OFFSET_X} cy={10.333 + HEAD_OFFSET_Y} r={EYE_RADIUS} $delay={160} $fill={palette.eyes} />
    </Svg>
  )
}
