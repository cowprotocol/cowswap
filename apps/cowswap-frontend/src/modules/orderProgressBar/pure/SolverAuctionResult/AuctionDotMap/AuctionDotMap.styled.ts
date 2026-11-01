import { UI } from '@cowprotocol/ui'

import styled, { keyframes } from 'styled-components/macro'

import {
  getSolverAuctionDotBackground,
  getSolverAuctionDotSizePx,
} from '../shared/SolverAuctionSharedComponents.styled'
import { AuctionDotKind } from '../SolverAuctionResult.utils'

const DOT_POP_DURATION = '0.45s'

const dotPopPeakLow = keyframes`
  0% {
    transform: scale(0);
  }
  55% {
    transform: scale(1.25);
  }
  100% {
    transform: scale(1);
  }
`

const dotPopPeakMid = keyframes`
  0% {
    transform: scale(0);
  }
  55% {
    transform: scale(1.5);
  }
  100% {
    transform: scale(1);
  }
`

const dotPopPeakHigh = keyframes`
  0% {
    transform: scale(0);
  }
  55% {
    transform: scale(1.75);
  }
  100% {
    transform: scale(1);
  }
`

const dotPopPeakMax = keyframes`
  0% {
    transform: scale(0);
  }
  55% {
    transform: scale(2);
  }
  100% {
    transform: scale(1);
  }
`

const DOT_POP_ANIMATIONS = [dotPopPeakLow, dotPopPeakMid, dotPopPeakHigh, dotPopPeakMax] as const

const DOT_POP_DELAYS_MS = [0, 160, 45, 210, 95, 130, 25, 185, 70, 240, 110, 55] as const

function dotPopAnimation(index: number): (typeof DOT_POP_ANIMATIONS)[number] {
  return DOT_POP_ANIMATIONS[(index * 5 + 3) % DOT_POP_ANIMATIONS.length] ?? DOT_POP_ANIMATIONS[0]
}

function dotPopDelayMs(index: number): number {
  return DOT_POP_DELAYS_MS[index % DOT_POP_DELAYS_MS.length] ?? 0
}

export const DotMap = styled.div`
  display: grid;
  grid-template-columns: repeat(9, minmax(0, 1fr));
  width: calc(100% + 100% / 18);
  overflow: visible;
  padding: 0 3px;
`

export const Dot = styled.span<{ $rowIsOdd: boolean }>`
  position: relative;
  width: 100%;
  height: 20px;
  transform: ${({ $rowIsOdd }) => ($rowIsOdd ? '' : 'translate(-50%, 0)')};
`

export const DotAnchor = styled.span<{ $rowIsOdd: boolean }>`
  position: absolute;
  top: 0;
  bottom: 0;
  left: ${({ $rowIsOdd }) => ($rowIsOdd ? '0' : 'auto')};
  right: ${({ $rowIsOdd }) => ($rowIsOdd ? 'auto' : '0')};
  transform: ${({ $rowIsOdd }) => ($rowIsOdd ? 'translate(-50%, 0)' : 'translate(50%, 0)')};
  display: flex;
  align-items: center;
`

export const DotDisc = styled.span<{ $kind: AuctionDotKind; $index: number }>`
  width: ${({ $kind }) => getSolverAuctionDotSizePx($kind)};
  height: ${({ $kind }) => getSolverAuctionDotSizePx($kind)};
  border-radius: 50%;
  background: ${({ $kind }) => getSolverAuctionDotBackground($kind)};
  transform-origin: center;
  animation: ${({ $index }) => dotPopAnimation($index)} ${DOT_POP_DURATION} ease both;
  animation-delay: ${({ $index }) => dotPopDelayMs($index)}ms;

  ${({ $kind }) =>
    $kind === 'won'
      ? `
      box-shadow: 0 0 0 6px color-mix(in srgb, var(${UI.COLOR_SUCCESS}) 28%, transparent);
    `
      : ''}

  @media (prefers-reduced-motion: reduce) {
    transform: scale(1);
    animation: none;
  }
`
