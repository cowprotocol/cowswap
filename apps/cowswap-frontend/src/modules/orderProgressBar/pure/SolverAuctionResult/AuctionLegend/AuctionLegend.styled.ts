import { font, UI } from '@cowprotocol/ui'

import styled from 'styled-components/macro'

import {
  getSolverAuctionDotBackground,
  getSolverAuctionDotSizePx,
} from '../shared/SolverAuctionSharedComponents.styled'
import { AuctionDotKind } from '../SolverAuctionResult.utils'

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
  width: ${({ $kind }) => getSolverAuctionDotSizePx($kind)};
  height: ${({ $kind }) => getSolverAuctionDotSizePx($kind)};
  flex-shrink: 0;
  border-radius: 50%;
  background: ${({ $kind }) => getSolverAuctionDotBackground($kind)};
`

export const LegendTotal = styled.span`
  ${font('FONT_SMALL', 'semibold')}
  margin-left: auto;
  color: var(${UI.COLOR_TEXT});
  white-space: nowrap;
`
