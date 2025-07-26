import { ReactNode } from 'react'

import { BridgeActivitySummary } from 'modules/bridge'

import { SurplusData } from 'common/hooks/useGetSurplusFiatValue'
import { SwapAndBridgeContexts } from 'common/hooks/useSwapAndBridgeContext'
import { RateInfoParams } from 'common/pure/RateInfo'
import { ActivityDerivedState } from 'common/types/activity'

interface OrderSummaryType {
  from: ReactNode | undefined
  to: ReactNode | undefined
  limitPrice: string | undefined
  executionPrice?: string | undefined
  validTo: string | undefined
  fulfillmentTime?: string | undefined
  kind?: string
}

interface ActivityDetailsContentProps {
  isOrder: boolean
  order: ActivityDerivedState['order']
  isBridgeOrder: boolean
  activityName: string
  orderBasicDetails: ReactNode
  hooksDetails: ReactNode
  orderSummary: OrderSummaryType
  isOrderFulfilled: boolean
  rateInfoParams: RateInfoParams
  isCancelled: boolean
  isExpired: boolean
  isCustomRecipient: boolean
  isCustomRecipientWarningVisible: boolean
  receiverEnsName: string | null | undefined
  chainId: number
  surplusAmount: SurplusData['surplusAmount']
  surplusToken: SurplusData['surplusToken']
  showFiatValue: boolean
  surplusFiatValue: SurplusData['surplusFiatValue']
  swapAndBridgeContext: SwapAndBridgeContexts['swapAndBridgeContext']
  swapResultContext: SwapAndBridgeContexts['swapResultContext']
  swapAndBridgeOverview: SwapAndBridgeContexts['swapAndBridgeOverview']
  summary: string | undefined
  id: string
  RegularOrderLayout: React.ComponentType<{
    kind: string | undefined
    from: ReactNode
    to: ReactNode
    isOrderFulfilled: boolean
    rateInfoParams: RateInfoParams
    fulfillmentTime: string | undefined
    validTo: string | undefined
    isCancelled: boolean
    isExpired: boolean
    order: ActivityDerivedState['order']
    isCustomRecipient: boolean
    isCustomRecipientWarningVisible: boolean
    receiverEnsName: string | null | undefined
    chainId: number
    surplusAmount: SurplusData['surplusAmount']
    surplusToken: SurplusData['surplusToken']
    showFiatValue: boolean
    surplusFiatValue: SurplusData['surplusFiatValue']
    hooksDetails: ReactNode
  }>
}

function OrderContent({
  order,
  isBridgeOrder,
  orderBasicDetails,
  hooksDetails,
  orderSummary,
  isOrderFulfilled,
  rateInfoParams,
  isCancelled,
  isExpired,
  isCustomRecipient,
  isCustomRecipientWarningVisible,
  receiverEnsName,
  chainId,
  surplusAmount,
  surplusToken,
  showFiatValue,
  surplusFiatValue,
  swapAndBridgeContext,
  swapResultContext,
  swapAndBridgeOverview,
  RegularOrderLayout,
}: Omit<ActivityDetailsContentProps, 'isOrder' | 'activityName' | 'summary' | 'id'>): ReactNode {
  const { kind, from, to, fulfillmentTime, validTo } = orderSummary

  if (order && isBridgeOrder) {
    return (
      <BridgeActivitySummary
        isCustomRecipientWarning={!!isCustomRecipientWarningVisible}
        order={order}
        swapAndBridgeContext={swapAndBridgeContext}
        swapResultContext={swapResultContext}
        swapAndBridgeOverview={swapAndBridgeOverview}
        orderBasicDetails={orderBasicDetails}
      >
        {hooksDetails}
      </BridgeActivitySummary>
    )
  }

  return (
    <RegularOrderLayout
      kind={kind}
      from={from}
      to={to}
      isOrderFulfilled={isOrderFulfilled}
      rateInfoParams={rateInfoParams}
      fulfillmentTime={fulfillmentTime}
      validTo={validTo}
      isCancelled={isCancelled}
      isExpired={isExpired}
      order={order}
      isCustomRecipient={isCustomRecipient}
      isCustomRecipientWarningVisible={isCustomRecipientWarningVisible}
      receiverEnsName={receiverEnsName}
      chainId={chainId}
      surplusAmount={surplusAmount}
      surplusToken={surplusToken}
      showFiatValue={showFiatValue}
      surplusFiatValue={surplusFiatValue}
      hooksDetails={hooksDetails}
    />
  )
}

export function ActivityDetailsContent({
  isOrder,
  activityName,
  summary,
  id,
  ...orderProps
}: ActivityDetailsContentProps): ReactNode {
  return (
    <>
      <b>{activityName}</b>
      {isOrder ? <OrderContent {...orderProps} /> : (summary ?? id)}
    </>
  )
}