import { useMemo } from 'react'

import { getChainInfo } from '@cowprotocol/common-const'
import { BridgeStatus, SupportedChainId } from '@cowprotocol/cow-sdk'
import { useTokensByAddressMap } from '@cowprotocol/tokens'
import { useWalletInfo } from '@cowprotocol/wallet'
import { CurrencyAmount } from '@uniswap/sdk-core'

import { useBridgeOrderData, useCrossChainOrder } from 'entities/bridgeOrders'
import { useBridgeSupportedNetworks } from 'entities/bridgeProvider'
import { bridgingSdk } from 'tradingSdk/bridgingSdk'

import type { Order } from 'legacy/state/orders/actions'

import {
  BridgingProgressContext,
  QuoteBridgeContext,
  SwapAndBridgeContext,
  SwapAndBridgeOverview,
  SwapAndBridgeStatus,
  SwapResultContext,
} from 'modules/bridge/types'

import type { SolverCompetition } from 'common/types/soverCompetition'

import { useSwapAndBridgeOverview } from './useSwapAndBridgeOverview'
import { useSwapResultsContext } from './useSwapResultsContext'

const bridgeStatusMap: Record<BridgeStatus, SwapAndBridgeStatus> = {
  [BridgeStatus.IN_PROGRESS]: SwapAndBridgeStatus.PENDING,
  [BridgeStatus.EXECUTED]: SwapAndBridgeStatus.DONE,
  [BridgeStatus.EXPIRED]: SwapAndBridgeStatus.FAILED,
  [BridgeStatus.REFUND]: SwapAndBridgeStatus.REFUND_COMPLETE,
  [BridgeStatus.UNKNOWN]: SwapAndBridgeStatus.DEFAULT,
}

export interface SwapAndBridgeContexts {
  swapAndBridgeContext: SwapAndBridgeContext | undefined
  swapResultContext: SwapResultContext | undefined
  swapAndBridgeOverview: SwapAndBridgeOverview | undefined
}

// TODO: Break down this large function into smaller functions
// eslint-disable-next-line max-lines-per-function,complexity
export function useSwapAndBridgeContext(
  chainId: SupportedChainId,
  order: Order | undefined,
  winningSolver: SolverCompetition | undefined,
): SwapAndBridgeContexts {
  const { account } = useWalletInfo()
  const { data: bridgeSupportedNetworks } = useBridgeSupportedNetworks()
  const tokensByAddress = useTokensByAddressMap()

  const { data: crossChainOrder } = useCrossChainOrder(chainId, order?.id)

  const intermediateToken = order && tokensByAddress[order.buyToken.toLowerCase()]

  const fullAppData = order?.apiAdditionalInfo?.fullAppData

  const bridgeProvider = useMemo(() => {
    return fullAppData ? bridgingSdk.getProviderFromAppData(fullAppData)?.info : undefined
  }, [fullAppData])

  const swapResultContext = useSwapResultsContext(order, winningSolver, intermediateToken)
  const bridgeOrderData = useBridgeOrderData(order?.id)

  const bridgeQuoteAmounts = bridgeOrderData?.quoteAmounts
  const targetRecipient = bridgeOrderData?.recipient || crossChainOrder?.bridgingParams.recipient
  const bridgeFee = bridgeQuoteAmounts?.bridgeFee || null

  const bridgeOutputAmount = crossChainOrder?.bridgingParams.outputAmount

  /**
   * Get receive amount from crossChainOrder if possible
   * Otherwise, fallback to bridgeQuoteAmounts
   */
  const bridgeReceiveAmount = useMemo(() => {
    if (!order) return undefined

    return (
      (!!crossChainOrder &&
        !!bridgeOutputAmount &&
        CurrencyAmount.fromRawAmount(order.outputToken, bridgeOutputAmount.toString())) ||
      bridgeQuoteAmounts?.bridgeMinReceiveAmount
    )
  }, [order, bridgeQuoteAmounts, crossChainOrder, bridgeOutputAmount])

  /**
   * Bridge provider might not be able to derive `bridgingParams.outputAmount` before destination chain transaction is mined
   * In that case we will display values we got from a quote before
   */
  const targetAmounts = useMemo(() => {
    if (!intermediateToken) return undefined

    if (bridgeQuoteAmounts) {
      return {
        sellAmount: bridgeQuoteAmounts.swapMinReceiveAmount,
        buyAmount: bridgeQuoteAmounts.bridgeMinReceiveAmount,
      }
    }

    if (crossChainOrder && bridgeReceiveAmount) {
      return {
        sellAmount: CurrencyAmount.fromRawAmount(
          intermediateToken,
          crossChainOrder.bridgingParams.inputAmount.toString(),
        ),
        buyAmount: bridgeReceiveAmount,
      }
    }

    return undefined
  }, [bridgeQuoteAmounts, crossChainOrder, bridgeReceiveAmount, intermediateToken])

  const swapAndBridgeOverview = useSwapAndBridgeOverview(order, intermediateToken, targetAmounts, targetRecipient)

  // TODO: Break down this large function into smaller functions
  // TODO: Reduce function complexity by extracting logic
  // eslint-disable-next-line complexity
  const swapAndBridgeContext: SwapAndBridgeContext | undefined = useMemo(() => {
    if (!account || !bridgeProvider || !swapResultContext || !order || !swapAndBridgeOverview) {
      return undefined
    }

    const sourceChainId = order.inputToken.chainId
    const destinationChainId = order.outputToken.chainId
    const sourceChainData = getChainInfo(sourceChainId)
    const destChainData = bridgeSupportedNetworks?.find((chain) => chain.id === destinationChainId)

    if (!sourceChainData || !destChainData) {
      return undefined
    }

    /**
     * Swap is finished, but bridging status is not loaded yet
     */
    if (!crossChainOrder || !bridgeReceiveAmount || !swapAndBridgeOverview.targetAmounts) {
      return {
        bridgingStatus: SwapAndBridgeStatus.DEFAULT,
        overview: swapAndBridgeOverview,
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
      bridgeFee,
      estimatedTime: null,
      recipient: crossChainOrder.bridgingParams.recipient,
      sellAmount: swapAndBridgeOverview.targetAmounts.sellAmount,
      buyAmount: swapAndBridgeOverview.targetAmounts.buyAmount,
      buyAmountUsd: null,
    }

    return {
      bridgingStatus,
      overview: swapAndBridgeOverview,
      bridgeProvider,
      quoteBridgeContext,
      bridgingProgressContext,
      swapResultContext,
      statusResult: crossChainOrder.statusResult,
    }
  }, [
    order,
    swapResultContext,
    account,
    bridgeProvider,
    crossChainOrder,
    bridgeSupportedNetworks,
    bridgeReceiveAmount,
    swapAndBridgeOverview,
    bridgeFee,
  ])

  return useMemo(
    () => ({ swapAndBridgeContext, swapResultContext, swapAndBridgeOverview }),
    [swapAndBridgeContext, swapResultContext, swapAndBridgeOverview],
  )
}
