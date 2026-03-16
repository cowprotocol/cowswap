import styled from 'styled-components/macro'

export const OrderActionsWrapper = styled.div`
  display: flex;
  align-items: center;
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
