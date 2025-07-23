import { ReactNode } from 'react'

import type { Order } from 'legacy/state/orders/actions'

import { ShimmerWrapper, SummaryRow } from 'common/pure/OrderSummaryRow'

import { BridgeStepRow } from './BridgeStepRow'
import { BridgeSummaryHeader } from './BridgeSummaryHeader'
import { SwapStepRow } from './SwapStepRow'

import { SwapAndBridgeContext, SwapAndBridgeOverview, SwapResultContext } from '../../types'

interface BridgeActivitySummaryProps {
  order: Order
  isCustomRecipientWarning: boolean
  swapAndBridgeContext: SwapAndBridgeContext | undefined
  swapResultContext: SwapResultContext | undefined
  swapAndBridgeOverview: SwapAndBridgeOverview | undefined
  children: ReactNode
  orderBasicDetails: ReactNode
}

export function BridgeActivitySummary(props: BridgeActivitySummaryProps): ReactNode {
  const {
    order,
    swapAndBridgeContext,
    swapResultContext,
    swapAndBridgeOverview,
    orderBasicDetails,
    children,
    isCustomRecipientWarning,
  } = props

  // If swapAndBridgeOverview is undefined, fall back to basic loading state with step details
  if (!swapAndBridgeOverview) {
    const isSwapFilled = !!order.fulfillmentTime
    
    return (
      <>
        <SummaryRow>
          <b>From</b>
          <i>
            <ShimmerWrapper />
          </i>
        </SummaryRow>
        {/* Don't show "To at least" row when bridge data is loading to avoid showing incorrect chain info */}
        {orderBasicDetails}
        <SummaryRow>
          <b>Swap</b>
          <i>
            {isSwapFilled ? (
              <>✓ Filled</>
            ) : (
              <ShimmerWrapper />
            )}
          </i>
        </SummaryRow>
        <SummaryRow>
          <b>Bridge</b>
          <i>
            {isSwapFilled ? (
              <>Loading...</>
            ) : (
              <ShimmerWrapper />
            )}
          </i>
        </SummaryRow>
        {children}
      </>
    )
  }

  return (
    <>
      <BridgeSummaryHeader
        order={order}
        isCustomRecipientWarning={isCustomRecipientWarning}
        swapAndBridgeOverview={swapAndBridgeOverview}
        swapAndBridgeContext={swapAndBridgeContext}
      />

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
