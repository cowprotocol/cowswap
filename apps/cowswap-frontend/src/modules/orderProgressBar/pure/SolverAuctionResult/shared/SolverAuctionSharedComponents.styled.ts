import { font, UI } from '@cowprotocol/ui'

import styled from 'styled-components/macro'

import { AuctionDotKind } from '../SolverAuctionResult.utils'

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

export function getSolverAuctionDotBackground(kind: AuctionDotKind): string {
  if (kind === 'won') return `var(${UI.COLOR_SUCCESS})`
  if (kind === 'bid') return `var(${UI.COLOR_TEXT_OPACITY_50})`
  if (kind === 'idle') return `var(${UI.COLOR_TEXT_OPACITY_15})`
  return `var(${UI.COLOR_TEXT_OPACITY_15})`
}

export function getSolverAuctionDotSizePx(kind: AuctionDotKind): string {
  if (kind === 'won') return '12px'
  if (kind === 'bid') return '10px'
  if (kind === 'idle') return '6px'
  return '6px'
}
