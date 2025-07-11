import { ReactNode } from 'react'

import { capitalizeFirstLetter } from '@cowprotocol/common-utils'
import { TokenLogo } from '@cowprotocol/tokens'
import { TokenAmount } from '@cowprotocol/ui'

import { SummaryRow } from 'common/pure/OrderSummaryRow'

import { SwapAndBridgeOverview } from '../../types'

interface BridgeSummaryHeaderProps {
  swapAndBridgeOverview: SwapAndBridgeOverview
}

export function BridgeSummaryHeader({ swapAndBridgeOverview }: BridgeSummaryHeaderProps): ReactNode {
  const { sourceAmounts, targetAmounts, sourceChainName, targetChainName } = swapAndBridgeOverview

  const hasBridgingAmount = !!targetAmounts?.buyAmount
  const bridgingAmount = targetAmounts?.buyAmount || sourceAmounts.bridgingApproximateAmount
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
        <b>{!hasBridgingAmount ? 'To about ≈' : 'To at least'}</b>
        <i>
          <TokenLogo token={bridgingAmount.currency} size={20} />
          <TokenAmount amount={bridgingAmount} tokenSymbol={bridgingAmount.currency} />
          {` on ${capitalizeFirstLetter(targetChainName)}`}
        </i>
      </SummaryRow>
    </>
  )
}
