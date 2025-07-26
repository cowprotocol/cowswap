import { ReactNode } from 'react'

import { BridgeActivitySummary } from 'modules/bridge'

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
  rateInfoParams: unknown
  isCancelled: boolean
  isExpired: boolean
  isCustomRecipient: boolean
  isCustomRecipientWarningVisible: boolean
  receiverEnsName: string | undefined
  chainId: number
  surplusAmount: unknown
  surplusToken: unknown
  showFiatValue: boolean
  surplusFiatValue: unknown
  swapAndBridgeContext: unknown
  swapResultContext: unknown
  swapAndBridgeOverview: unknown
  summary: string | undefined
  id: string
  RegularOrderLayout: React.ComponentType<unknown>
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