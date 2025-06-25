import { ReactNode } from 'react'

import { TokenLogo } from '@cowprotocol/tokens'
import { TokenAmount } from '@cowprotocol/ui'
import type { Currency, CurrencyAmount } from '@uniswap/sdk-core'

import { ShimmerWrapper, SummaryRow } from 'common/pure/OrderSummaryRow'

interface BridgeSummaryHeaderProps<
  Amounts = {
    sellAmount: CurrencyAmount<Currency>
    buyAmount: CurrencyAmount<Currency>
  },
> {
  sourceAmounts: Amounts
  targetAmounts: Amounts | undefined
  sourceChainName: string
  targetChainName: string
}

export function BridgeSummaryHeader({
  sourceAmounts,
  targetAmounts,
  sourceChainName,
  targetChainName,
}: BridgeSummaryHeaderProps): ReactNode {
  return (
    <>
      <SummaryRow>
        <b>From</b>
        <i>
          <TokenLogo token={sourceAmounts.sellAmount.currency} size={20} />
          <TokenAmount amount={sourceAmounts.sellAmount} tokenSymbol={sourceAmounts.sellAmount.currency} />
          {` on ${sourceChainName}`}
        </i>
      </SummaryRow>

      <SummaryRow>
        <b>To at least</b>
        <i>
          {targetAmounts ? (
            <>
              <TokenLogo token={targetAmounts.buyAmount.currency} size={20} />
              <TokenAmount amount={targetAmounts.buyAmount} tokenSymbol={targetAmounts.buyAmount.currency} />
            </>
          ) : (
            <ShimmerWrapper />
          )}
          {` on ${targetChainName}`}
        </i>
      </SummaryRow>
    </>
  )
}
