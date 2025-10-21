import { ReactNode, useEffect, useRef } from 'react'

import { GtmEvent, useCowAnalytics } from '@cowprotocol/analytics'
import { TokenWithLogo } from '@cowprotocol/common-const'
import { formatTokenAmount, timeSinceInSeconds } from '@cowprotocol/common-utils'
import { SupportedChainId } from '@cowprotocol/cow-sdk'
import { BridgeStatus, BridgeStatusResult, CrossChainOrder } from '@cowprotocol/sdk-bridging'
import { TokensByAddress, useTokensByAddressMap } from '@cowprotocol/tokens'
import { UiOrderType } from '@cowprotocol/types'
import { useWalletInfo } from '@cowprotocol/wallet'
import { CurrencyAmount } from '@uniswap/sdk-core'

import { isOrderInPendingTooLong, triggerAppziSurvey } from 'appzi'
import { useCrossChainOrder, usePendingBridgeOrders, useUpdateBridgeOrderQuote } from 'entities/bridgeOrders'
import { useAddOrderToSurplusQueue } from 'entities/surplusModal'

import { emitBridgingSuccessEvent } from 'modules/orders'
import { getCowSoundError, getCowSoundSuccess } from 'modules/sounds'

import { CowSwapAnalyticsCategory } from 'common/analytics/types'

const APPZI_CHECK_INTERVAL = 60_000

type RawAmount = string | number | bigint | null | undefined
type BridgeStatusWithRefund = BridgeStatusResult & { refundTxHash?: string }

type BooleanRef = { current: boolean }
type BridgeStatusRef = { current: BridgeStatus | undefined }

const formatBridgeAmount = (token: TokenWithLogo | undefined, rawAmount: RawAmount): string | undefined => {
  if (!token || rawAmount === null || rawAmount === undefined) {
    return undefined
  }

  try {
    const amount = CurrencyAmount.fromRawAmount(token, rawAmount.toString())
    const formatted = formatTokenAmount(amount)
    return formatted || undefined
  } catch {
    return undefined
  }
}

const toBridgeAmountRaw = (rawAmount: RawAmount): string | undefined => {
  if (rawAmount === null || rawAmount === undefined) return undefined

  if (typeof rawAmount === 'string') return rawAmount
  if (typeof rawAmount === 'number' || typeof rawAmount === 'bigint') return rawAmount.toString()

  return undefined
}

const getBridgeToken = (tokensByAddress: TokensByAddress, address: string | undefined): TokenWithLogo | undefined => {
  if (!address) return undefined
  return tokensByAddress[address.toLowerCase()]
}

const getBridgeStatusTxHash = (statusResult: BridgeStatusResult): string | undefined => {
  if (statusResult.fillTxHash) return statusResult.fillTxHash
  if (statusResult.depositTxHash) return statusResult.depositTxHash

  if ('refundTxHash' in statusResult) {
    const { refundTxHash } = statusResult as BridgeStatusWithRefund
    if (refundTxHash) return refundTxHash
  }

  return undefined
}

interface PendingSurveyParams {
  crossChainOrder: CrossChainOrder | null | undefined
  openSince?: number
  waitingTooLongNpsTriggeredRef: BooleanRef
}

const usePendingBridgeTooLongSurvey = ({
  crossChainOrder,
  openSince,
  waitingTooLongNpsTriggeredRef,
}: PendingSurveyParams): void => {
  useEffect(() => {
    if (!crossChainOrder || waitingTooLongNpsTriggeredRef.current) return

    const interval = setInterval(() => {
      if (waitingTooLongNpsTriggeredRef.current) {
        clearInterval(interval)
        return
      }

      const isPendingTooLong = isOrderInPendingTooLong(openSince, true)
      if (isPendingTooLong) {
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
  }, [crossChainOrder, openSince, waitingTooLongNpsTriggeredRef])
}

interface BridgeAnalyticsParams {
  crossChainOrder: CrossChainOrder | null | undefined
  openSince: number | undefined
  updateBridgeOrderQuote: ReturnType<typeof useUpdateBridgeOrderQuote>
  addOrderToSurplusQueue: ReturnType<typeof useAddOrderToSurplusQueue>
  analytics: ReturnType<typeof useCowAnalytics>
  tokensByAddress: TokensByAddress
  hasReportedRef: BooleanRef
  lastStatusRef: BridgeStatusRef
}

const useBridgeStatusAnalytics = ({
  crossChainOrder,
  openSince,
  updateBridgeOrderQuote,
  addOrderToSurplusQueue,
  analytics,
  tokensByAddress,
  hasReportedRef,
  lastStatusRef,
}: BridgeAnalyticsParams): void => {
  useEffect(() => {
    if (!crossChainOrder) return

    const orderUid = crossChainOrder.order.uid
    const orderStatus = crossChainOrder.statusResult.status
    const isOrderExecuted = orderStatus === BridgeStatus.EXECUTED
    const isOrderFailed = orderStatus === BridgeStatus.REFUND || orderStatus === BridgeStatus.EXPIRED
    const hasStatusChanged = lastStatusRef.current !== orderStatus

    const { sourceChainId, destinationChainId } = crossChainOrder.bridgingParams

    updateBridgeOrderQuote(orderUid, crossChainOrder.statusResult)

    const analyticsSummary = `From: ${sourceChainId}, to: ${destinationChainId}`

    if (isOrderExecuted && hasStatusChanged) {
      addOrderToSurplusQueue(orderUid)
      processExecutedBridging(crossChainOrder)

      const latencyMs = openSince ? Date.now() - openSince : undefined

      if (!hasReportedRef.current) {
        hasReportedRef.current = true
        const bridgeAliasFields = buildBridgeSuccessAliasFields(crossChainOrder, tokensByAddress)
        analytics.sendEvent({
          category: CowSwapAnalyticsCategory.Bridge,
          action: 'bridging_succeeded',
          label: analyticsSummary,
          orderId: orderUid,
          chainId: sourceChainId,
          fromChainId: sourceChainId,
          toChainId: destinationChainId,
          tokenIn: crossChainOrder.order.sellToken,
          tokenOut: crossChainOrder.order.buyToken,
          amountIn: crossChainOrder.order.sellAmount,
          amountOutReceived: crossChainOrder.bridgingParams.outputAmount?.toString(),
          bridgeProvider: crossChainOrder.provider.info.name,
          txHash: getBridgeStatusTxHash(crossChainOrder.statusResult),
          latencyMs,
          page: 'swap',
          ...bridgeAliasFields,
        } as GtmEvent<CowSwapAnalyticsCategory.Bridge>)
      }
    } else if (isOrderFailed && hasStatusChanged) {
      getCowSoundError().play()

      analytics.sendEvent({
        category: CowSwapAnalyticsCategory.Bridge,
        action: 'bridging_failed',
        label: analyticsSummary,
        orderId: orderUid,
        chainId: sourceChainId,
        fromChainId: sourceChainId,
        toChainId: destinationChainId,
        bridgeProvider: crossChainOrder.provider.info.name,
        txHash: getBridgeStatusTxHash(crossChainOrder.statusResult),
        page: 'swap',
      } as GtmEvent<CowSwapAnalyticsCategory.Bridge>)
    }

    lastStatusRef.current = orderStatus
  }, [
    crossChainOrder,
    openSince,
    updateBridgeOrderQuote,
    addOrderToSurplusQueue,
    analytics,
    tokensByAddress,
    hasReportedRef,
    lastStatusRef,
  ])
}

export const buildBridgeSuccessAliasFields = (
  crossChainOrder: CrossChainOrder,
  tokensByAddress: TokensByAddress,
): Record<string, string | undefined> => {
  const { inputTokenAddress, outputTokenAddress, inputAmount, outputAmount } = crossChainOrder.bridgingParams

  const inputToken = getBridgeToken(tokensByAddress, inputTokenAddress)
  const outputToken = getBridgeToken(tokensByAddress, outputTokenAddress)
  const fromAmountFormatted = formatBridgeAmount(inputToken, inputAmount)
  const toAmountFormatted = formatBridgeAmount(outputToken, outputAmount)
  const fromAmountRaw = toBridgeAmountRaw(inputAmount)
  const toAmountRaw = toBridgeAmountRaw(outputAmount)
  const fromAmount = fromAmountFormatted ?? fromAmountRaw
  const toAmount = toAmountFormatted ?? toAmountRaw

  return {
    from_currency_address: inputTokenAddress || '',
    to_currency_address: outputTokenAddress || '',
    from_currency: inputToken?.symbol || '',
    to_currency: outputToken?.symbol || '',
    from_amount: fromAmount || undefined,
    to_amount: toAmount || undefined,
  }
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
  const tokensByAddress = useTokensByAddressMap()
  const waitingTooLongNpsTriggeredRef = useRef(false)
  const hasReportedRef = useRef(false)
  const lastStatusRef = useRef<BridgeStatus | undefined>(undefined)

  usePendingBridgeTooLongSurvey({ crossChainOrder, openSince, waitingTooLongNpsTriggeredRef })
  useBridgeStatusAnalytics({
    crossChainOrder,
    openSince,
    updateBridgeOrderQuote,
    addOrderToSurplusQueue,
    analytics,
    tokensByAddress,
    hasReportedRef,
    lastStatusRef,
  })

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
