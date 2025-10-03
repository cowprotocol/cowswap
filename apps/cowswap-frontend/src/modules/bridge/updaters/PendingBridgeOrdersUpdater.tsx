import { ReactNode, useEffect, useRef } from 'react'

import { GtmEvent, useCowAnalytics } from '@cowprotocol/analytics'
import { timeSinceInSeconds } from '@cowprotocol/common-utils'
import { SupportedChainId } from '@cowprotocol/cow-sdk'
import { BridgeStatus, CrossChainOrder } from '@cowprotocol/sdk-bridging'
import { UiOrderType } from '@cowprotocol/types'
import { useWalletInfo } from '@cowprotocol/wallet'

import { isOrderInPendingTooLong, triggerAppziSurvey } from 'appzi'
import { useCrossChainOrder, usePendingBridgeOrders, useUpdateBridgeOrderQuote } from 'entities/bridgeOrders'
import { useAddOrderToSurplusQueue } from 'entities/surplusModal'

import { emitBridgingSuccessEvent } from 'modules/orders'
import { getCowSoundError, getCowSoundSuccess } from 'modules/sounds'

import { CowSwapAnalyticsCategory } from 'common/analytics/types'

const APPZI_CHECK_INTERVAL = 60_000

function usePendingOrderWaitingSurvey(crossChainOrder: CrossChainOrder | undefined, openSince?: number): void {
  const waitingTooLongNpsTriggeredRef = useRef(false)

  useEffect(() => {
    if (!crossChainOrder || waitingTooLongNpsTriggeredRef.current) return

    const interval = setInterval(() => {
      if (waitingTooLongNpsTriggeredRef.current) {
        clearInterval(interval)
        return
      }

      const isPendingTooLong = isOrderInPendingTooLong(openSince, true)
      if (isPendingTooLong) {
        triggerAppziSurvey({
          isBridging: true,
          explorerUrl: crossChainOrder.explorerUrl,
          chainId: crossChainOrder.chainId,
          orderType: UiOrderType.SWAP,
          account: crossChainOrder.order.owner,
          waitedTooLong: true,
          secondsSinceOpen: timeSinceInSeconds(openSince),
        })
        waitingTooLongNpsTriggeredRef.current = true
      }
    }, APPZI_CHECK_INTERVAL)

    return () => clearInterval(interval)
  }, [crossChainOrder, openSince])
}

function usePendingOrderCompletionAnalytics(
  crossChainOrder: CrossChainOrder | undefined,
  openSince: number | undefined,
  updateBridgeOrderQuote: ReturnType<typeof useUpdateBridgeOrderQuote>,
  addOrderToSurplusQueue: ReturnType<typeof useAddOrderToSurplusQueue>,
  analytics: ReturnType<typeof useCowAnalytics>,
): void {
  const hasReportedRef = useRef(false)

  useEffect(() => {
    if (!crossChainOrder) return

    const orderUid = crossChainOrder.order.uid
    const orderStatus = crossChainOrder.statusResult.status
    const isOrderExecuted = orderStatus === BridgeStatus.EXECUTED
    const isOrderFailed = orderStatus === BridgeStatus.REFUND || orderStatus === BridgeStatus.EXPIRED

    const { sourceChainId, destinationChainId } = crossChainOrder.bridgingParams

    updateBridgeOrderQuote(orderUid, crossChainOrder.statusResult)

    const analyticsSummary = `From: ${sourceChainId}, to: ${destinationChainId}`

    if (isOrderExecuted) {
      addOrderToSurplusQueue(orderUid)
      processExecutedBridging(crossChainOrder)

      const latencyMs = openSince ? Date.now() - openSince : undefined

      if (!hasReportedRef.current) {
        hasReportedRef.current = true
        analytics.sendEvent({
          category: CowSwapAnalyticsCategory.Bridge,
          action: 'bridging_succeeded',
          label: analyticsSummary,
          orderId: orderUid,
          fromChainId: sourceChainId,
          toChainId: destinationChainId,
          tokenIn: crossChainOrder.order.sellToken,
          tokenOut: crossChainOrder.order.buyToken,
          amountIn: crossChainOrder.order.sellAmount,
          amountOutReceived: crossChainOrder.bridgingParams.outputAmount?.toString(),
          bridgeProvider: crossChainOrder.provider.info.name,
          txHash: crossChainOrder.statusResult.fillTxHash || crossChainOrder.statusResult.depositTxHash,
          latencyMs,
          page: 'swap',
        } as GtmEvent<CowSwapAnalyticsCategory.Bridge>)
      }
    } else if (isOrderFailed) {
      getCowSoundError().play()

      analytics.sendEvent({
        category: CowSwapAnalyticsCategory.Bridge,
        action: 'bridging_failed',
        label: analyticsSummary,
        orderId: orderUid,
        fromChainId: sourceChainId,
        toChainId: destinationChainId,
      } as GtmEvent<CowSwapAnalyticsCategory.Bridge>)
    }
  }, [
    crossChainOrder,
    updateBridgeOrderQuote,
    addOrderToSurplusQueue,
    analytics,
    openSince,
  ])
}

function processExecutedBridging(crossChainOrder: CrossChainOrder): void {
  const { provider: _, ...eventPayload } = crossChainOrder

  // Display snackbar
  emitBridgingSuccessEvent(eventPayload)

  // Play sound
  getCowSoundSuccess().play()

  // Trigger Appzi survey
  triggerAppziSurvey(
    {
      isBridging: true,
      explorerUrl: crossChainOrder.explorerUrl,
      chainId: crossChainOrder.chainId,
      orderType: UiOrderType.SWAP,
      account: crossChainOrder.order.owner,
    },
    'nps',
  )
}

interface PendingOrderUpdaterProps {
  chainId: SupportedChainId
  orderUid: string
  openSince?: number
}

function PendingOrderUpdater({ chainId, orderUid, openSince }: PendingOrderUpdaterProps): ReactNode {
  const { data: crossChainOrder } = useCrossChainOrder(chainId, orderUid)
  const updateBridgeOrderQuote = useUpdateBridgeOrderQuote()
  const addOrderToSurplusQueue = useAddOrderToSurplusQueue()
  const analytics = useCowAnalytics()

  usePendingOrderWaitingSurvey(crossChainOrder, openSince)
  usePendingOrderCompletionAnalytics(
    crossChainOrder,
    openSince,
    updateBridgeOrderQuote,
    addOrderToSurplusQueue,
    analytics,
  )

  return null
}

export function PendingBridgeOrdersUpdater(): ReactNode {
  const { chainId } = useWalletInfo()

  const pendingBridgeOrders = usePendingBridgeOrders()

  if (!pendingBridgeOrders) return null

  return (
    <>
      {pendingBridgeOrders.map((order) => (
        <PendingOrderUpdater
          key={order.orderUid}
          chainId={chainId}
          orderUid={order.orderUid}
          openSince={order.creationTimestamp}
        />
      ))}
    </>
  )
}
