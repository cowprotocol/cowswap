import { ReactNode } from 'react'

import { Trans } from '@lingui/react/macro'

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

  // If swapAndBridgeOverview is undefined, the data is still loading
  // Return null to let the parent component handle the loading state appropriately
  if (!swapAndBridgeOverview) {
    return null
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
          <b>
            <Trans>Bridge</Trans>
          </b>
          <i>
            <ShimmerWrapper />
          </i>
        </SummaryRow>
      )}

      {children}
    </>
  )
}
