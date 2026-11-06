import { Media } from '@cowprotocol/ui'

import styled, { css } from 'styled-components/macro'

export const tradeRowsWideStyles = css`
  margin: 0 -6px;
  width: calc(100% + 12px);

  ${Media.upToExtraSmall()} {
    margin: 0 -2px;
    width: calc(100% + 4px);
  }
`

export const TradeRows = styled.div`
  display: flex;
  flex-flow: column wrap;
  max-width: 100%;
  padding: 0 6px;
  gap: 7px;

  ${Media.upToExtraSmall()} {
    padding: 0 2px;
  }

  &:empty {
    display: none;
  }
`

export const TradeRowsWide = styled.div`
  ${tradeRowsWideStyles}

  &:empty {
    display: none;
  }
`
