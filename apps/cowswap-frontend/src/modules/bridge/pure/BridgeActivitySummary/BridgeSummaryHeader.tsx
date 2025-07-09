import { ReactNode } from 'react'

import { capitalizeFirstLetter } from '@cowprotocol/common-utils'
import { TokenLogo } from '@cowprotocol/tokens'
import { TokenAmount } from '@cowprotocol/ui'

import { ShimmerWrapper, SummaryRow } from 'common/pure/OrderSummaryRow'

import { SwapAndBridgeOverview } from '../../types'

interface BridgeSummaryHeaderProps {
  swapAndBridgeOverview: SwapAndBridgeOverview
}

export function BridgeSummaryHeader({ swapAndBridgeOverview }: BridgeSummaryHeaderProps): ReactNode {
  const { sourceAmounts, targetAmounts, sourceChainName, targetChainName } = swapAndBridgeOverview

  return (
    <>
      <SummaryRow>
        <b>From</b>
        <i>
          <TokenLogo token={sourceAmounts.sellAmount.currency} size={20} />
          <TokenAmount amount={sourceAmounts.sellAmount} tokenSymbol={sourceAmounts.sellAmount.currency} />
          {` on ${capitalizeFirstLetter(sourceChainName)}`}
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
          {` on ${capitalizeFirstLetter(targetChainName)}`}
        </i>
      </SummaryRow>
    </>
  )
}
