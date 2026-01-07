/* eslint-disable no-restricted-imports */ // TODO: Don't use 'modules' import
import { useMemo } from 'react'

import { getChainInfo, TokenWithLogo } from '@cowprotocol/common-const'
import { SupportedChainId } from '@cowprotocol/cow-sdk'
import { BridgeStatus } from '@cowprotocol/sdk-bridging'
import { useTokensByAddressMap } from '@cowprotocol/tokens'
import { useWalletInfo } from '@cowprotocol/wallet'
import { CurrencyAmount } from '@uniswap/sdk-core'

import { t } from '@lingui/core/macro'
import { useBridgeOrderData, useCrossChainOrder } from 'entities/bridgeOrders'
import { useBridgeSupportedNetwork } from 'entities/bridgeProvider'
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

import { useBridgeOrderOutputToken } from './useBridgeOrderOutputToken'
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
  intermediateToken: TokenWithLogo | undefined
  isLoading: boolean
}

// TODO: Break down this large function into smaller functions
// eslint-disable-next-line max-lines-per-function,complexity
export function useSwapAndBridgeContext(
  chainId: SupportedChainId,
  order: Order | undefined,
  winningSolver: SolverCompetition | undefined,
): SwapAndBridgeContexts {
  const { account } = useWalletInfo()
  const tokensByAddress = useTokensByAddressMap()

  const { data: crossChainOrder, isLoading: isCrossChainOrderLoading } = useCrossChainOrder(chainId, order?.id)

  // Try to get the intermediate token from the tokensByAddress map first
  // If not available (common in fresh sessions), create a fallback token from order data
  const intermediateToken = useMemo(() => {
    if (!order) return undefined

    // Primary: Try to get from tokensByAddress map (enriched with logos, etc.)
    const enrichedToken = tokensByAddress[order.buyToken.toLowerCase()]
    if (enrichedToken) {
      return enrichedToken
    }

    // Fallback: Create basic TokenWithLogo from order data when tokensByAddress isn't populated yet
    // This allows bridge functionality to work in fresh sessions while token lists are loading
    return TokenWithLogo.fromToken({
      chainId: order.inputToken.chainId, // Intermediate token is on same chain as input
      address: order.buyToken,
      decimals: order.outputToken.decimals, // Use output token decimals as approximation
      symbol: t`Loading...`, // Placeholder until tokens are loaded
      name: t`Loading...`, // Placeholder until tokens are loaded
    })
  }, [order, tokensByAddress])

  const fullAppData = order?.apiAdditionalInfo?.fullAppData

  const bridgeProvider = useMemo(() => {
    return fullAppData ? bridgingSdk.getProviderFromAppData(fullAppData)?.info : undefined
  }, [fullAppData])

  const swapResultContext = useSwapResultsContext(order, winningSolver, intermediateToken)
  const bridgeOrderData = useBridgeOrderData(order?.id)
  const outputToken = useBridgeOrderOutputToken(order, crossChainOrder)

  const sourceChainId = order?.inputToken.chainId
  const bridgeQuoteAmounts = bridgeOrderData?.quoteAmounts
  const targetRecipient = bridgeOrderData?.recipient || crossChainOrder?.bridgingParams.recipient
  const bridgeFee = bridgeQuoteAmounts?.bridgeFee || null
  const bridgeMinReceiveAmount = bridgeQuoteAmounts?.bridgeMinReceiveAmount || null
  const bridgeOutputAmount = crossChainOrder?.bridgingParams.outputAmount
  const receivedAmount = swapResultContext?.receivedAmount

  const destinationChainId = outputToken?.chainId
  const destChainData = useBridgeSupportedNetwork(destinationChainId)

  /**
   * Get receive amount from crossChainOrder if possible
   * Otherwise, fallback to bridgeQuoteAmounts
   */
  const bridgeReceiveAmount = useMemo(() => {
    if (!outputToken) return undefined

    return (
      (!!crossChainOrder &&
        !!bridgeOutputAmount &&
        CurrencyAmount.fromRawAmount(outputToken, bridgeOutputAmount.toString())) ||
      bridgeMinReceiveAmount
    )
  }, [outputToken, bridgeMinReceiveAmount, crossChainOrder, bridgeOutputAmount])

  /**
   * Bridge provider might not be able to derive `bridgingParams.outputAmount` before destination chain transaction is mined
   * In that case we will display values we got from a quote before
   */
  const targetAmounts = useMemo(() => {
    if (!intermediateToken) return undefined

    if (crossChainOrder && bridgeReceiveAmount) {
      return {
        sellAmount:
          receivedAmount ??
          CurrencyAmount.fromRawAmount(intermediateToken, crossChainOrder.bridgingParams.inputAmount.toString()),
        buyAmount: bridgeReceiveAmount,
      }
    }

    if (bridgeQuoteAmounts && !bridgeOutputAmount) {
      return {
        sellAmount: receivedAmount ?? bridgeQuoteAmounts.swapMinReceiveAmount,
        buyAmount: bridgeQuoteAmounts.bridgeMinReceiveAmount,
      }
    }

    return undefined
  }, [bridgeQuoteAmounts, crossChainOrder, bridgeReceiveAmount, intermediateToken, receivedAmount, bridgeOutputAmount])

  const swapAndBridgeOverview = useSwapAndBridgeOverview(
    order,
    intermediateToken,
    outputToken,
    targetAmounts,
    targetRecipient,
    crossChainOrder?.bridgingParams.destinationChainId, // Override: prevents wrong chain flash (fallback token has source chainId)
  )

  // TODO: Break down this large function into smaller functions
  // TODO: Reduce function complexity by extracting logic
  // eslint-disable-next-line complexity
  const swapAndBridgeContext: SwapAndBridgeContext | undefined = useMemo(() => {
    if (!account || !bridgeProvider || !swapResultContext || !sourceChainId || !outputToken || !swapAndBridgeOverview) {
      return undefined
    }

    const sourceChainData = getChainInfo(sourceChainId)

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
        explorerUrl: crossChainOrder?.explorerUrl,
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
      destinationChainId: destChainData.id,
    }

    const quoteBridgeContext: QuoteBridgeContext = {
      chainName: destChainData.label,
      bridgeFee,
      estimatedTime: null,
      recipient: crossChainOrder.bridgingParams.recipient,
      sellAmount: swapAndBridgeOverview.targetAmounts.sellAmount,
      buyAmount: swapAndBridgeOverview.targetAmounts.buyAmount,
      buyAmountUsd: null,
      bridgeMinReceiveAmount,
      bridgeMinReceiveAmountUsd: null,
      bridgeMinDepositAmount: null,
      bridgeMinDepositAmountUsd: null,
      expectedToReceive: null,
      expectedToReceiveUsd: null,
    }

    return {
      bridgingStatus,
      overview: swapAndBridgeOverview,
      bridgeProvider,
      quoteBridgeContext,
      bridgingProgressContext,
      swapResultContext,
      statusResult: crossChainOrder.statusResult,
      explorerUrl: crossChainOrder.explorerUrl,
    }
  }, [
    sourceChainId,
    outputToken,
    swapResultContext,
    account,
    bridgeProvider,
    crossChainOrder,
    destChainData,
    bridgeReceiveAmount,
    swapAndBridgeOverview,
    bridgeFee,
    bridgeMinReceiveAmount,
  ])

  const isLoading = isCrossChainOrderLoading

  return useMemo(
    () => ({ swapAndBridgeContext, swapResultContext, swapAndBridgeOverview, intermediateToken, isLoading }),
    [swapAndBridgeContext, swapResultContext, swapAndBridgeOverview, intermediateToken, isLoading],
  )
}
