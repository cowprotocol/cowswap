import { ReactNode } from 'react'

import { ShimmerWrapper, SummaryRow } from 'common/pure/OrderSummaryRow'

import { BridgeStepRow } from './BridgeStepRow'
import { BridgeSummaryHeader } from './BridgeSummaryHeader'
import { SwapStepRow } from './SwapStepRow'

import { SwapAndBridgeContext, SwapAndBridgeOverview, SwapResultContext } from '../../types'

interface BridgeActivitySummaryProps {
  swapAndBridgeContext: SwapAndBridgeContext | undefined
  swapResultContext: SwapResultContext | undefined
  swapAndBridgeOverview: SwapAndBridgeOverview
  children: ReactNode
  orderBasicDetails: ReactNode
}

export function BridgeActivitySummary(props: BridgeActivitySummaryProps): ReactNode {
  const { swapAndBridgeContext, swapResultContext, swapAndBridgeOverview, orderBasicDetails, children } = props

  return (
    <>
      <BridgeSummaryHeader swapAndBridgeOverview={swapAndBridgeOverview} />

      <SwapStepRow
        swapResultContext={swapResultContext}
        sourceAmounts={swapAndBridgeOverview.sourceAmounts}
        sourceChainName={swapAndBridgeOverview.sourceChainName}
      >
        {orderBasicDetails}
      </SwapStepRow>

      {swapAndBridgeContext ? (
        <BridgeStepRow context={swapAndBridgeContext} />
      ) : (
        <SummaryRow>
          <b>Bridge</b>
          <i>
            <ShimmerWrapper />
          </i>
        </SummaryRow>
      )}

      {children}
    </>
  )
}
