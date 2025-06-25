import { ReactNode } from 'react'

import { TokenLogo } from '@cowprotocol/tokens'
import { TokenAmount } from '@cowprotocol/ui'

import { ShimmerWrapper, SummaryRow } from 'common/pure/OrderSummaryRow'

import { SwapAndBridgeContext } from '../../types'

interface BridgeSummaryHeaderProps {
  context: SwapAndBridgeContext
}

export function BridgeSummaryHeader({ context }: BridgeSummaryHeaderProps): ReactNode {
  const {
    overview: { sourceAmounts, targetAmounts, sourceChainName, targetChainName },
  } = context

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
