import { ExternalLink, font, Media, UI } from '@cowprotocol/ui'

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
  ${font('FONT_OVERLINE', 'semibold')}
  letter-spacing: 0.08em;
  color: color-mix(in srgb, var(${UI.COLOR_TEXT}) 65%, transparent);
  text-transform: uppercase;
`

export const Title = styled.h3`
  ${font('FONT_LARGE', 'semibold')}
  margin: 0;
  color: var(${UI.COLOR_TEXT});
`

export const Subtitle = styled.p`
  ${font('FONT_SMALL_PLUS', 'regular')}
  margin: 0;
  color: var(${UI.COLOR_TEXT_OPACITY_70});
`

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
  position: relative;
  overflow: visible;
  display: flex;
  flex-wrap: nowrap;
  align-items: center;
  gap: 8px;
  width: 100%;
  min-height: 36px;
  padding: 6px 12px 6px 6px;
  border-radius: 12px;
  background: ${({ $isWinner }) =>
    $isWinner ? `var(${UI.COLOR_SUCCESS_BG})` : `color-mix(in srgb, var(${UI.COLOR_TEXT}) 2%, transparent)`};
  color: ${({ $isWinner }) => ($isWinner ? `var(${UI.COLOR_SUCCESS_TEXT})` : `var(${UI.COLOR_TEXT})`)};
`

export const RowFill = styled.span<{ $percent: number }>`
  position: absolute;
  inset: 0 auto 0 0;
  width: ${({ $percent }) => `${$percent}%`};
  border-radius: 12px;
  background: color-mix(in srgb, var(${UI.COLOR_TEXT}) 6%, transparent);
  pointer-events: none;
`

export const RowContent = styled.div`
  position: relative;
  z-index: 1;
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 8px;
  width: 100%;
  height: 100%;
`

export const SolverInfo = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  flex: 1 1 auto;
  min-width: 0;
  height: 100%;
  color: inherit;
`

export const SolverDetails = styled.div`
  display: flex;
  flex-wrap: nowrap;
  align-items: center;
  gap: 8px;
  flex: 1 1 auto;
  min-width: 0;
  height: 100%;
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
  flex: 0 0 auto;
  color: inherit;
  text-transform: capitalize;
`

export const WinningBadge = styled.span`
  display: inline-flex;
  align-items: center;
  gap: 4px;
  flex: 0 0 auto;
  height: 23px;
  padding: 0 8px;
  border-radius: 12px;
  border: 1px solid color-mix(in srgb, var(${UI.COLOR_SUCCESS_TEXT}) 35%, transparent);
  color: var(${UI.COLOR_SUCCESS_TEXT});
  ${font('FONT_SMALL', 'bold')}
  line-height: 1;
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

export const BadgeTooltip = styled.span`
  display: inline-flex;
  align-items: center;
  color: inherit;
`

export const TooltipTitle = styled.strong`
  ${font('FONT_NORMAL', 'semibold')}
  display: block;
  margin-bottom: 4px;
`

export const TooltipBody = styled.span`
  ${font('FONT_SMALL_PLUS', 'regular')}
  display: block;
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

export const Footer = styled.div`
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: space-between;
  gap: 8px 12px;
  width: 100%;
`

export const ViewMoreButton = styled.button`
  display: inline-flex;
  align-items: center;
  justify-content: flex-start;
  gap: 4px;
  width: fit-content;
  margin: 0;
  padding: 4px 0;
  border: none;
  background: transparent;
  color: color-mix(in srgb, var(${UI.COLOR_TEXT}) 80%, transparent);
  cursor: pointer;
  ${font('FONT_SMALL_PLUS', 'semibold')}
  line-height: 1;

  &:hover {
    opacity: 0.85;
  }
`

export const AuctionDocsLink = styled(ExternalLink)`
  display: inline-flex;
  align-items: center;
  gap: 4px;
  margin-left: auto;
  color: var(${UI.COLOR_TEXT_OPACITY_70});
  ${font('FONT_SMALL', 'medium')}
  line-height: 1;

  > svg {
    width: 12px;
    height: 12px;
    flex-shrink: 0;
  }
`
