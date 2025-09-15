import { UI } from '@cowprotocol/ui'

import styled from 'styled-components/macro'

export const OrderWrapper = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 10px;
  background: var(${UI.COLOR_NEUTRAL_100});
  border-radius: 4px;
  margin-bottom: 1px;
`

export const SwapInfo = styled.div`
  display: flex;
`

export const AmountInfo = styled.div`
  display: flex;
  flex-direction: column;
  margin-left: 6px;

  .token-amount {
    font-size: 12px;
  }
`

export const TokenLogos = styled.div`
  display: flex;
  align-items: center;

  > *:not(:first-child) {
    margin-left: -14px;
  }
`

export const OrderActionsWrapper = styled.div`
  display: flex;
`
