import { TokenWithLogo } from '@cowprotocol/common-const'
import { OrderKind } from '@cowprotocol/cow-sdk'
import { TokenAmount } from '@cowprotocol/ui'
import { CurrencyAmount } from '@uniswap/sdk-core'

import styled from 'styled-components/macro'

import { ExplorerLink } from 'legacy/components/ExplorerLink'

const OrderLinkWrapper = styled.div`
  margin-top: 15px;
  text-decoration: underline;

  &:hover,
  &:hover a {
    text-decoration: none !important;
  }
`

interface PendingOrderNotificationProps {
  orderId: string
  kind: OrderKind
  inputAmount: CurrencyAmount<TokenWithLogo>
  outputAmount: CurrencyAmount<TokenWithLogo>
}

export function PendingOrderNotification({ orderId, kind, inputAmount, outputAmount }: PendingOrderNotificationProps) {
  const isSellOrder = kind === OrderKind.SELL

  const inputAmountElement = <TokenAmount amount={inputAmount} tokenSymbol={inputAmount.currency} />
  const outputAmountElement = <TokenAmount amount={outputAmount} tokenSymbol={outputAmount.currency} />

  return (
    <>
      <strong>Limit order submitted</strong>
      <br />
      {isSellOrder ? (
        <>
          Sell {inputAmountElement} for at least {outputAmountElement}
        </>
      ) : (
        <>
          Buy {outputAmountElement} for at most {inputAmountElement}
        </>
      )}
      <OrderLinkWrapper>
        <ExplorerLink id={orderId} type="transaction" />
      </OrderLinkWrapper>
    </>
  )
}
