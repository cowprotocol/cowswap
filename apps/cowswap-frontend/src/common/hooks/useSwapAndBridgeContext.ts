import { useMemo, useState } from 'react'

import { getChainInfo } from '@cowprotocol/common-const'
import { SupportedChainId, BridgeStatus, CrossChainOrder } from '@cowprotocol/cow-sdk'
import { useWalletInfo } from '@cowprotocol/wallet'
import { CurrencyAmount } from '@uniswap/sdk-core'

import { useBridgeSupportedNetworks } from 'entities/bridgeProvider'
import { bridgingSdk } from 'tradingSdk/bridgingSdk'

import type { Order } from 'legacy/state/orders/actions'

import { BridgeQuoteAmounts } from 'modules/bridge/hooks/useBridgeQuoteAmounts'
import { useUpdateBridgeOrderData } from 'modules/bridge/hooks/useUpdateBridgeOrderData'
import {
  BridgingProgressContext,
  QuoteBridgeContext,
  SwapAndBridgeContext,
  SwapAndBridgeOverview,
  SwapAndBridgeStatus,
  SwapResultContext,
} from 'modules/bridge/types'

import type { SolverCompetition } from 'common/types/soverCompetition'

import { useSwapResultsContext } from './useSwapResultsContext'

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
): { swapAndBridgeContext: SwapAndBridgeContext | undefined; swapResultContext: SwapResultContext | undefined } {
  const { account } = useWalletInfo()
  const { data: bridgeSupportedNetworks } = useBridgeSupportedNetworks()

  const [crossChainOrder, setCrossChainOrder] = useState<CrossChainOrder | null>(null)

  const fullAppData = order?.apiAdditionalInfo?.fullAppData

  const bridgeProvider = useMemo(() => {
    return fullAppData ? bridgingSdk.getProviderFromAppData(fullAppData)?.info : undefined
  }, [fullAppData])

  const swapResultContext = useSwapResultsContext(order, winningSolver)

  const isBridgingExecuted = crossChainOrder?.statusResult.status === BridgeStatus.EXECUTED

  /**
   * Poll bridge provider to get current bridging status
   */
  useUpdateBridgeOrderData(chainId, isBridgingExecuted ? undefined : order, setCrossChainOrder)

  // TODO: Break down this large function into smaller functions
  // TODO: Reduce function complexity by extracting logic
  // eslint-disable-next-line complexity
  const swapAndBridgeContext: SwapAndBridgeContext | undefined = useMemo(() => {
    if (!account || !bridgeProvider || !swapResultContext || !order) {
      return undefined
    }

    const sourceChainId = order.inputToken.chainId
    const destinationChainId = order.outputToken.chainId
    const sourceChainData = getChainInfo(sourceChainId)
    const destChainData = bridgeSupportedNetworks?.find((chain) => chain.id === destinationChainId)

    if (!sourceChainData || !destChainData) {
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
                swapResultContext.intermediateToken,
                crossChainOrder.bridgingParams.inputAmount.toString(),
              ),
              buyAmount: bridgeReceiveAmount,
            }
          : undefined

    const overview: SwapAndBridgeOverview = {
      sourceChainName: sourceChainData.label,
      targetChainName: destChainData.label,
      targetCurrency: order.outputToken,
      sourceAmounts: {
        sellAmount: CurrencyAmount.fromRawAmount(order.inputToken, order.sellAmount),
        buyAmount: CurrencyAmount.fromRawAmount(swapResultContext.intermediateToken, order.buyAmount),
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
  }, [order, swapResultContext, account, bridgeProvider, crossChainOrder, bridgeSupportedNetworks, bridgeQuoteAmounts])

  return useMemo(() => ({ swapAndBridgeContext, swapResultContext }), [swapAndBridgeContext, swapResultContext])
}
