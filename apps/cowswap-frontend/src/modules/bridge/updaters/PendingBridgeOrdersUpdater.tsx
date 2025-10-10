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
  const waitingTooLongNpsTriggeredRef = useRef(false)
  const hasReportedRef = useRef(false)

  // Check once a minute the time it has been pending and trigger appzi if greater than threshold
  useEffect(() => {
    if (!crossChainOrder || waitingTooLongNpsTriggeredRef.current) return

    const interval = setInterval(() => {
      if (waitingTooLongNpsTriggeredRef.current) {
        clearInterval(interval)
        return
      }

      const isPendingTooLong = isOrderInPendingTooLong(openSince, true)
      if (isPendingTooLong) {
        // Trigger Appzi survey for pending bridges that are pending for too long
        // Start counting from bridge creation timestamp
        const secondsSinceOpen = openSince ? timeSinceInSeconds(openSince) : undefined
        triggerAppziSurvey({
          isBridging: true,
          explorerUrl: crossChainOrder.explorerUrl,
          chainId: crossChainOrder.chainId,
          orderType: UiOrderType.SWAP,
          account: crossChainOrder.order.owner,
          waitedTooLong: true,
          secondsSinceOpen,
        })
        waitingTooLongNpsTriggeredRef.current = true
      }
    }, APPZI_CHECK_INTERVAL)

    return () => clearInterval(interval)
  }, [crossChainOrder, openSince])

  useEffect(() => {
    if (!crossChainOrder) return

    const orderUid = crossChainOrder.order.uid
    const orderStatus = crossChainOrder.statusResult.status
    const isOrderExecuted = orderStatus === BridgeStatus.EXECUTED
    // TODO: detect also when the bridge hook failed to execute after the order was executed
    const isOrderFailed = orderStatus === BridgeStatus.REFUND || orderStatus === BridgeStatus.EXPIRED

    const { sourceChainId, destinationChainId } = crossChainOrder.bridgingParams

    // Update bridge order status for ALL status changes, not just EXECUTED
    updateBridgeOrderQuote(orderUid, crossChainOrder.statusResult)

    const analyticsSummary = `From: ${sourceChainId}, to: ${destinationChainId}`

    if (isOrderExecuted) {
      // Display surplus modal
      addOrderToSurplusQueue(orderUid)

      processExecutedBridging(crossChainOrder)

      const latencyMs = openSince ? Date.now() - openSince : undefined

      // Only send analytics event once for this order instance.
      if (!hasReportedRef.current) {
        hasReportedRef.current = true
        analytics.sendEvent({
          category: CowSwapAnalyticsCategory.Bridge,
          action: 'bridging_succeeded',
          label: analyticsSummary,
          orderId: orderUid,
          chainId: sourceChainId,
          // TODO: migrate chainId to fromChainId/toChainId only once dashboards are updated
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
        chainId: sourceChainId,
        // TODO: migrate to fromChainId/toChainId only once dashboards are updated
        fromChainId: sourceChainId,
        toChainId: destinationChainId,
      } as GtmEvent<CowSwapAnalyticsCategory.Bridge>)
    }
  }, [chainId, crossChainOrder, updateBridgeOrderQuote, addOrderToSurplusQueue, analytics, openSince])

  return null
}

export function PendingBridgeOrdersUpdater(): ReactNode {
  const { chainId } = useWalletInfo()

  const pendingBridgeOrders = usePendingBridgeOrders()

  if (!pendingBridgeOrders) return null

  const orderUpdaters: ReactNode[] = []

  for (const order of pendingBridgeOrders) {
    orderUpdaters.push(
      <PendingOrderUpdater
        key={order.orderUid}
        chainId={chainId}
        orderUid={order.orderUid}
        openSince={order.creationTimestamp}
      />,
    )
  }

  return orderUpdaters
}
