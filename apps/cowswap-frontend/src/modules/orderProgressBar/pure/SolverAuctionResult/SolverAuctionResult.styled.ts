import { font, Media, UI } from '@cowprotocol/ui'

import styled, { keyframes } from 'styled-components/macro'

import { AuctionDotKind } from './SolverAuctionResult.utils'

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

function dotBackground(kind: AuctionDotKind): string {
  if (kind === 'won') return `var(${UI.COLOR_SUCCESS})`
  if (kind === 'bid') return `var(${UI.COLOR_TEXT_OPACITY_50})`
  if (kind === 'idle') return `var(${UI.COLOR_TEXT_OPACITY_15})`
  return `var(${UI.COLOR_TEXT_OPACITY_15})`
}

function dotPopAnimation(index: number): (typeof DOT_POP_ANIMATIONS)[number] {
  return DOT_POP_ANIMATIONS[(index * 5 + 3) % DOT_POP_ANIMATIONS.length] ?? DOT_POP_ANIMATIONS[0]
}

function dotPopDelayMs(index: number): number {
  return DOT_POP_DELAYS_MS[index % DOT_POP_DELAYS_MS.length] ?? 0
}

function dotSizePx(kind: AuctionDotKind): string {
  if (kind === 'won') return '12px'
  if (kind === 'bid') return '10px'
  if (kind === 'idle') return '6px'
  return '6px'
}

export const Wrapper = styled.div`
  --gap: 16px;

  display: flex;
  flex-direction: column;
  align-items: stretch;
  gap: var(--gap);
  padding: 20px;
  width: 100%;

  ${Media.upToSmall()} {
    --gap: 10px;
    padding: 10px;
  }
`

export const Header = styled.div`
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 4px;
  width: 100%;
`

export const Eyebrow = styled.span`
  ${font('FONT_SMALL', 'semibold')}
  line-height: 1;
  letter-spacing: 0.08em;
  color: var(${UI.COLOR_TEXT_OPACITY_50});
  text-transform: uppercase;
`

export const Title = styled.h3`
  ${font('FONT_LARGE', 'semibold')}
  margin: 0;
  line-height: 1;
  color: var(${UI.COLOR_TEXT});
`

export const DotMap = styled.div`
  display: grid;
  grid-template-columns: repeat(12, minmax(0, 1fr));
  width: 100%;
  margin: 0 calc(-1 * (100% - 40px) / 12 / 2);
  width: auto;
`

export const Dot = styled.span<{ $kind: AuctionDotKind; $index: number }>`
  width: 100%;
  aspect-ratio: 1;
  display: grid;
  place-items: center;

  &::before {
    content: '';
    width: ${({ $kind }) => dotSizePx($kind)};
    height: ${({ $kind }) => dotSizePx($kind)};
    border-radius: 50%;
    background: ${({ $kind }) => dotBackground($kind)};
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
  }
`

export const Legend = styled.div`
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 12px 16px;
  width: 100%;
  border-bottom: 1px solid var(${UI.COLOR_BORDER});
  padding-bottom: var(--gap);
`

export const LegendItems = styled.div`
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 12px 16px;
  flex: 1 1 auto;
  min-width: 0;
`

export const LegendItem = styled.span`
  ${font('FONT_SMALL', 'regular')}
  display: inline-flex;
  align-items: center;
  gap: 6px;
  color: var(${UI.COLOR_TEXT_OPACITY_70});
`

export const LegendDot = styled.span<{ $kind: Exclude<AuctionDotKind, 'placeholder'> }>`
  width: ${({ $kind }) => dotSizePx($kind)};
  height: ${({ $kind }) => dotSizePx($kind)};
  flex-shrink: 0;
  border-radius: 50%;
  background: ${({ $kind }) => dotBackground($kind)};
`

export const LegendTotal = styled.span`
  ${font('FONT_SMALL', 'semibold')}
  margin-left: auto;
  color: var(${UI.COLOR_TEXT});
  white-space: nowrap;
`

export const List = styled.ul`
  display: flex;
  flex-direction: column;
  gap: 6px;
  width: 100%;
  margin: 0;
  padding: 0;
  list-style: none;
`

export const Row = styled.li<{ $isWinner: boolean }>`
  display: flex;
  align-items: center;
  gap: 8px;
  width: 100%;
  padding: 10px 12px;
  border-radius: 12px;
  background: ${({ $isWinner }) => ($isWinner ? `var(${UI.COLOR_SUCCESS_BG})` : `var(${UI.COLOR_PAPER_DARKER})`)};
  color: ${({ $isWinner }) => ($isWinner ? `var(${UI.COLOR_SUCCESS_TEXT})` : `var(${UI.COLOR_TEXT})`)};
`

export const SolverInfo = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  min-width: 0;
  color: inherit;
`

export const SolverLogo = styled.img`
  width: 24px;
  height: 24px;
  flex-shrink: 0;
  border-radius: 12px;
  object-fit: cover;
`

export const SolverName = styled.span`
  ${font('FONT_NORMAL', 'semibold')}
  display: flex;
  align-items: center;
  gap: 4px;
  min-width: 0;
  color: inherit;
  text-transform: capitalize;
`

export const WinningBadge = styled.span`
  display: inline-flex;
  align-items: center;
  gap: 4px;
  flex-shrink: 0;
  padding: 4px 8px;
  border-radius: 12px;
  border: 1px solid color-mix(in srgb, var(${UI.COLOR_SUCCESS_TEXT}) 35%, transparent);
  color: var(${UI.COLOR_SUCCESS_TEXT});
  ${font('FONT_SMALL', 'bold')}
  white-space: nowrap;
`

export const TrophyIcon = styled.span`
  display: inline-flex;
  align-items: center;
  color: inherit;

  > svg {
    width: 12px;
    height: 12px;
  }
`

export const BidValue = styled.span<{ $isWinner?: boolean }>`
  ${font('FONT_NORMAL', 'semibold')}
  display: inline-flex;
  align-items: center;
  justify-content: flex-end;
  flex-shrink: 0;
  margin-left: auto;
  color: ${({ $isWinner }) => ($isWinner ? `var(${UI.COLOR_SUCCESS_TEXT})` : `var(${UI.COLOR_TEXT_OPACITY_70})`)};
  white-space: nowrap;

  .fiat-amount {
    opacity: 1;
    color: inherit;
  }
`

export const ViewMoreButton = styled.button`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 4px;
  width: fit-content;
  margin: 0 auto;
  padding: 4px 0;
  border: none;
  background: transparent;
  color: var(${UI.COLOR_TEXT});
  cursor: pointer;
  ${font('FONT_NORMAL', 'semibold')}

  &:hover {
    opacity: 0.85;
  }
`
