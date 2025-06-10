import { useMemo, useState } from 'react'

import { getChainInfo } from '@cowprotocol/common-const'
import { SupportedChainId, BridgeStatus, CrossChainOrder } from '@cowprotocol/cow-sdk'
import { useTokensByAddressMap } from '@cowprotocol/tokens'
import { useWalletInfo } from '@cowprotocol/wallet'
import { CurrencyAmount } from '@uniswap/sdk-core'

import { useBridgeSupportedNetworks } from 'entities/bridgeProvider'
import { bridgingSdk } from 'tradingSdk/bridgingSdk'

import type { Order } from 'legacy/state/orders/actions'

import type { SolverCompetition } from 'modules/orderProgressBar'
import { useUsdAmount } from 'modules/usdAmount'

import { getExecutedSummaryData } from 'utils/getExecutedSummaryData'

import { BridgeQuoteAmounts } from './useBridgeQuoteAmounts'
import { useUpdateBridgeOrderData } from './useUpdateBridgeOrderData'

import {
  BridgingProgressContext,
  QuoteBridgeContext,
  SwapAndBridgeContext,
  SwapAndBridgeOverview,
  SwapAndBridgeStatus,
  SwapResultContext,
} from '../types'

const bridgeStatusMap: Record<BridgeStatus, SwapAndBridgeStatus> = {
  [BridgeStatus.IN_PROGRESS]: SwapAndBridgeStatus.PENDING,
  [BridgeStatus.EXECUTED]: SwapAndBridgeStatus.DONE,
  [BridgeStatus.EXPIRED]: SwapAndBridgeStatus.FAILED,
  [BridgeStatus.REFUND]: SwapAndBridgeStatus.REFUND_COMPLETE,
  [BridgeStatus.UNKNOWN]: SwapAndBridgeStatus.DEFAULT,
}

// TODO: Break down this large function into smaller functions
// eslint-disable-next-line max-lines-per-function
export function useSwapAndBridgeContext(
  chainId: SupportedChainId,
  order: Order | undefined,
  winningSolver: SolverCompetition | undefined,
  bridgeQuoteAmounts?: BridgeQuoteAmounts,
): SwapAndBridgeContext | undefined {
  const { account } = useWalletInfo()
  const { data: bridgeSupportedNetworks } = useBridgeSupportedNetworks()
  const tokensByAddress = useTokensByAddressMap()

  const [crossChainOrder, setCrossChainOrder] = useState<CrossChainOrder | null>(null)

  const fullAppData = order?.apiAdditionalInfo?.fullAppData
  const intermediateToken = order && tokensByAddress[order.buyToken.toLowerCase()]

  const bridgeProvider = useMemo(() => {
    return fullAppData ? bridgingSdk.getProviderFromAppData(fullAppData)?.info : undefined
  }, [fullAppData])

  const executedSummary = useMemo(() => {
    return order ? getExecutedSummaryData(order) : undefined
  }, [order])

  const { swappedAmountWithFee, surplusAmount } = executedSummary || {}

  /**
   * By default, order.outputToken has target chain currency
   * We should use source chain currency instead (intermediateToken)
   */
  const receivedAmount = useMemo(() => {
    if (!intermediateToken || !swappedAmountWithFee) return undefined

    return CurrencyAmount.fromRawAmount(intermediateToken, swappedAmountWithFee.toString())
  }, [swappedAmountWithFee, intermediateToken])

  const receivedAmountUsd = useUsdAmount(receivedAmount).value
  const surplusAmountUsd = useUsdAmount(surplusAmount).value

  const isBridgingExecuted = crossChainOrder?.statusResult.status === BridgeStatus.EXECUTED

  /**
   * Poll bridge provider to get current bridging status
   */
  useUpdateBridgeOrderData(chainId, isBridgingExecuted ? undefined : order, setCrossChainOrder)

  // TODO: Break down this large function into smaller functions
  // TODO: Reduce function complexity by extracting logic
  // eslint-disable-next-line max-lines-per-function, complexity
  return useMemo(() => {
    if (
      !account ||
      !bridgeProvider ||
      !winningSolver ||
      !receivedAmount ||
      receivedAmount.equalTo(0) ||
      !surplusAmount ||
      !order
    ) {
      return undefined
    }

    const swapResultContext: SwapResultContext = {
      winningSolver,
      receivedAmount,
      surplusAmount,
      surplusAmountUsd,
      receivedAmountUsd,
    }

    const sourceChainId = order.inputToken.chainId
    const destinationChainId = order.outputToken.chainId
    const sourceChainData = getChainInfo(sourceChainId)
    const destChainData = bridgeSupportedNetworks?.find((chain) => chain.id === destinationChainId)

    if (!sourceChainData || !intermediateToken || !destChainData) {
      return undefined
    }

    const bridgeOutputAmount = crossChainOrder?.bridgingParams.outputAmount

    /**
     * Get receive amount from crossChainOrder if possible
     * Otherwise, fallback to bridgeQuoteAmounts
     */
    const bridgeReceiveAmount =
      (!!crossChainOrder &&
        !!bridgeOutputAmount &&
        CurrencyAmount.fromRawAmount(order.outputToken, bridgeOutputAmount.toString())) ||
      bridgeQuoteAmounts?.bridgeMinReceiveAmount

    /**
     * Bridge provider might not be able to derive `bridgingParams.outputAmount` before destination chain transaction is mined
     * In that case we will display values we got from a quote before
     */
    const targetAmounts =
      bridgeQuoteAmounts && !bridgeOutputAmount
        ? {
            sellAmount: bridgeQuoteAmounts.swapMinReceiveAmount,
            buyAmount: bridgeQuoteAmounts.bridgeMinReceiveAmount,
          }
        : crossChainOrder && bridgeReceiveAmount
          ? {
              sellAmount: CurrencyAmount.fromRawAmount(
                intermediateToken,
                crossChainOrder.bridgingParams.inputAmount.toString(),
              ),
              buyAmount: bridgeReceiveAmount,
            }
          : undefined

    const overview: SwapAndBridgeOverview = {
      sourceChainName: sourceChainData.name,
      targetChainName: destChainData.label,
      targetCurrency: order.outputToken,
      sourceAmounts: {
        sellAmount: CurrencyAmount.fromRawAmount(order.inputToken, order.sellAmount),
        buyAmount: CurrencyAmount.fromRawAmount(intermediateToken, order.buyAmount),
      },
      targetAmounts,
    }

    /**
     * Swap is finished, but bridging status is not loaded yet
     */
    if (!crossChainOrder || !bridgeReceiveAmount || !overview.targetAmounts) {
      return {
        bridgingStatus: SwapAndBridgeStatus.DEFAULT,
        overview,
        bridgeProvider,
        swapResultContext,
      }
    }

    const status = crossChainOrder.statusResult.status
    const bridgingStatus = status ? bridgeStatusMap[status] : SwapAndBridgeStatus.DEFAULT

    const bridgingProgressContext: BridgingProgressContext = {
      account,
      isFailed: status === BridgeStatus.EXPIRED,
      isRefunded: status === BridgeStatus.REFUND,
      receivedAmount: status === BridgeStatus.EXECUTED ? bridgeReceiveAmount : undefined,
      receivedAmountUsd: undefined,
      sourceChainId,
      destinationChainId,
    }

    const quoteBridgeContext: QuoteBridgeContext = {
      chainName: destChainData.label,
      bridgeFee: null,
      estimatedTime: null,
      recipient: crossChainOrder.bridgingParams.recipient,
      sellAmount: overview.targetAmounts.sellAmount,
      buyAmount: overview.targetAmounts.buyAmount,
      buyAmountUsd: null,
    }

    return {
      bridgingStatus,
      overview,
      bridgeProvider,
      quoteBridgeContext,
      bridgingProgressContext,
      swapResultContext,
      statusResult: crossChainOrder.statusResult,
    }
  }, [
    order,
    intermediateToken,
    account,
    bridgeProvider,
    winningSolver,
    receivedAmount,
    receivedAmountUsd,
    surplusAmount,
    surplusAmountUsd,
    crossChainOrder,
    bridgeSupportedNetworks,
    bridgeQuoteAmounts,
  ])
}
