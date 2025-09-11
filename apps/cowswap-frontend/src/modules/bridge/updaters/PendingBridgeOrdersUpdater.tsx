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
  const reportedOrdersRef = useRef(new Set<string>())

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

      // Calculate latency if possible (from order creation to completion)
      const secondsSinceStart = openSince ? timeSinceInSeconds(openSince) : undefined
      const latencyMs = secondsSinceStart ? secondsSinceStart * 1000 : undefined

      // Only send analytics event once per order
      if (!reportedOrdersRef.current.has(orderUid)) {
        reportedOrdersRef.current.add(orderUid)
        analytics.sendEvent({
        category: CowSwapAnalyticsCategory.Bridge,
        action: 'bridging_succeeded',
        label: analyticsSummary,
        orderId: orderUid,
        from_chain_id: sourceChainId,
        to_chain_id: destinationChainId,
        token_in: crossChainOrder.order.sellToken,
        token_out: crossChainOrder.order.buyToken,
        amount_in: crossChainOrder.order.sellAmount,
        amount_out_received: crossChainOrder.bridgingParams.outputAmount,
        bridge_provider: crossChainOrder.provider.info.name,
        tx_hash: crossChainOrder.statusResult.fillTxHash || crossChainOrder.statusResult.depositTxHash,
        latency_ms: latencyMs,
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
      } as GtmEvent<CowSwapAnalyticsCategory.Bridge>)
    }
  }, [crossChainOrder, updateBridgeOrderQuote, addOrderToSurplusQueue, analytics, openSince])

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
