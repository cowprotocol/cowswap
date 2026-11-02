import { font, UI } from '@cowprotocol/ui'

import styled from 'styled-components/macro'

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

  & + & {
    margin-top: 6px;
  }
`

export const RowFill = styled.span<{ $percent: number }>`
  position: absolute;
  inset: 0 auto 0 0;
  width: ${({ $percent }) => `${$percent}%`};
  border-radius: 12px;
  background: color-mix(in srgb, var(${UI.COLOR_TEXT}) 6%, transparent);
  pointer-events: none;
  transition: width var(${UI.ANIMATION_DURATION_SLOW}) ease-out;

  @media (prefers-reduced-motion: reduce) {
    transition: none;
  }
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
  object-fit: contain;
  background: var(${UI.COLOR_WHITE});
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
