import { useMemo, useState } from 'react'

import { getChainInfo } from '@cowprotocol/common-const'
import { SupportedChainId, BridgeStatus, CrossChainOrder, BridgeProviderInfo } from '@cowprotocol/cow-sdk'
import { useTokensByAddressMap } from '@cowprotocol/tokens'
import { useWalletInfo } from '@cowprotocol/wallet'
import { CurrencyAmount, Currency, Token } from '@uniswap/sdk-core'

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

function createSwapResultContext(
  winningSolver: SolverCompetition,
  receivedAmount: CurrencyAmount<Currency>,
  surplusAmount: CurrencyAmount<Currency>,
  surplusAmountUsd: CurrencyAmount<Token> | null,
  receivedAmountUsd: CurrencyAmount<Token> | null,
): SwapResultContext {
  return {
    winningSolver,
    receivedAmount,
    surplusAmount,
    surplusAmountUsd,
    receivedAmountUsd,
  }
}

/**
 * Get receive amount from crossChainOrder if possible
 * Otherwise, fallback to bridgeQuoteAmounts
 */
function calculateBridgeReceiveAmount(
  crossChainOrder: CrossChainOrder | null,
  order: Order,
  bridgeQuoteAmounts?: BridgeQuoteAmounts,
): CurrencyAmount<Currency> | undefined {
  const bridgeOutputAmount = crossChainOrder?.bridgingParams.outputAmount

  return (
    (!!crossChainOrder &&
      !!bridgeOutputAmount &&
      CurrencyAmount.fromRawAmount(order.outputToken, bridgeOutputAmount.toString())) ||
    bridgeQuoteAmounts?.bridgeMinReceiveAmount
  )
}

/**
 * Bridge provider might not be able to derive `bridgingParams.outputAmount` before destination chain transaction is mined
 * In that case we will display values we got from a quote before
 */
function calculateTargetAmounts(
  bridgeQuoteAmounts: BridgeQuoteAmounts | undefined,
  crossChainOrder: CrossChainOrder | null,
  bridgeReceiveAmount: CurrencyAmount<Currency> | undefined,
  intermediateToken: Token,
  bridgeOutputAmount: bigint | null | undefined,
): { sellAmount: CurrencyAmount<Currency>; buyAmount: CurrencyAmount<Currency> } | undefined {
  if (bridgeQuoteAmounts && !bridgeOutputAmount) {
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
}

function createOverview(
  sourceChainData: ReturnType<typeof getChainInfo>,
  destChainData: { label: string },
  order: Order,
  intermediateToken: Token,
  targetAmounts: { sellAmount: CurrencyAmount<Currency>; buyAmount: CurrencyAmount<Currency> } | undefined,
): SwapAndBridgeOverview {
  return {
    sourceChainName: sourceChainData.name,
    targetChainName: destChainData.label,
    targetCurrency: order.outputToken,
    sourceAmounts: {
      sellAmount: CurrencyAmount.fromRawAmount(order.inputToken, order.sellAmount),
      buyAmount: CurrencyAmount.fromRawAmount(intermediateToken, order.buyAmount),
    },
    targetAmounts,
  }
}

function createBridgingProgressContext(
  account: string,
  status: BridgeStatus | undefined,
  bridgeReceiveAmount: CurrencyAmount<Currency> | undefined,
  sourceChainId: number,
  destinationChainId: number,
): BridgingProgressContext {
  return {
    account,
    isFailed: status === BridgeStatus.EXPIRED,
    isRefunded: status === BridgeStatus.REFUND,
    receivedAmount: status === BridgeStatus.EXECUTED ? bridgeReceiveAmount : undefined,
    receivedAmountUsd: undefined,
    sourceChainId,
    destinationChainId,
  }
}

function createQuoteBridgeContext(
  destChainData: { label: string },
  crossChainOrder: CrossChainOrder,
  targetAmounts: { sellAmount: CurrencyAmount<Currency>; buyAmount: CurrencyAmount<Currency> },
): QuoteBridgeContext {
  return {
    chainName: destChainData.label,
    bridgeFee: null,
    estimatedTime: null,
    recipient: crossChainOrder.bridgingParams.recipient,
    sellAmount: targetAmounts.sellAmount,
    buyAmount: targetAmounts.buyAmount,
    buyAmountUsd: null,
  }
}

function validateContextInputs(
  account: string | undefined,
  bridgeProvider: BridgeProviderInfo | undefined,
  winningSolver: SolverCompetition | undefined,
  receivedAmount: CurrencyAmount<Currency> | undefined,
  surplusAmount: CurrencyAmount<Currency> | undefined,
  order: Order | undefined,
): boolean {
  return !!(
    account &&
    bridgeProvider &&
    winningSolver &&
    receivedAmount &&
    !receivedAmount.equalTo(0) &&
    surplusAmount &&
    order
  )
}

function createPendingContext(
  overview: SwapAndBridgeOverview,
  bridgeProvider: BridgeProviderInfo,
  swapResultContext: SwapResultContext,
): SwapAndBridgeContext {
  return {
    bridgingStatus: SwapAndBridgeStatus.DEFAULT,
    overview,
    bridgeProvider,
    swapResultContext,
  }
}

function createCompleteContext(
  bridgingStatus: SwapAndBridgeStatus,
  overview: SwapAndBridgeOverview,
  bridgeProvider: BridgeProviderInfo,
  quoteBridgeContext: QuoteBridgeContext,
  bridgingProgressContext: BridgingProgressContext,
  swapResultContext: SwapResultContext,
  statusResult: CrossChainOrder['statusResult'],
): SwapAndBridgeContext {
  return {
    bridgingStatus,
    overview,
    bridgeProvider,
    quoteBridgeContext,
    bridgingProgressContext,
    swapResultContext,
    statusResult,
  }
}

function validateChainData(
  sourceChainData: ReturnType<typeof getChainInfo> | undefined,
  destChainData: { label: string } | undefined,
): boolean {
  return !!(sourceChainData && destChainData)
}

function calculateBridgeData(
  crossChainOrder: CrossChainOrder | null,
  order: Order,
  bridgeQuoteAmounts: BridgeQuoteAmounts | undefined,
  intermediateToken: Token,
): {
  bridgeReceiveAmount: CurrencyAmount<Currency> | undefined
  targetAmounts: { sellAmount: CurrencyAmount<Currency>; buyAmount: CurrencyAmount<Currency> } | undefined
} {
  const bridgeOutputAmount = crossChainOrder?.bridgingParams.outputAmount
  const bridgeReceiveAmount = calculateBridgeReceiveAmount(crossChainOrder, order, bridgeQuoteAmounts)
  const targetAmounts = calculateTargetAmounts(
    bridgeQuoteAmounts,
    crossChainOrder,
    bridgeReceiveAmount,
    intermediateToken,
    bridgeOutputAmount,
  )

  return { bridgeReceiveAmount, targetAmounts }
}

function processCompleteContext(
  crossChainOrder: CrossChainOrder,
  overview: SwapAndBridgeOverview,
  bridgeReceiveAmount: CurrencyAmount<Currency>,
  account: string,
  sourceChainId: number,
  destinationChainId: number,
  destChainData: { label: string },
  bridgeProvider: BridgeProviderInfo,
  swapResultContext: SwapResultContext,
): SwapAndBridgeContext {
  if (!overview.targetAmounts) {
    throw new Error('Target amounts must be defined for complete context')
  }

  const status = crossChainOrder.statusResult.status
  const bridgingStatus = status ? bridgeStatusMap[status] : SwapAndBridgeStatus.DEFAULT

  const bridgingProgressContext = createBridgingProgressContext(
    account,
    status,
    bridgeReceiveAmount,
    sourceChainId,
    destinationChainId,
  )

  const quoteBridgeContext = createQuoteBridgeContext(destChainData, crossChainOrder, overview.targetAmounts)

  return createCompleteContext(
    bridgingStatus,
    overview,
    bridgeProvider,
    quoteBridgeContext,
    bridgingProgressContext,
    swapResultContext,
    crossChainOrder.statusResult,
  )
}

function createContextData(
  order: Order,
  bridgeSupportedNetworks: ReturnType<typeof useBridgeSupportedNetworks>['data'],
  intermediateToken: Token,
  crossChainOrder: CrossChainOrder | null,
  bridgeQuoteAmounts: BridgeQuoteAmounts | undefined,
  winningSolver: SolverCompetition,
  receivedAmount: CurrencyAmount<Currency>,
  surplusAmount: CurrencyAmount<Currency>,
  surplusAmountUsd: CurrencyAmount<Token> | null,
  receivedAmountUsd: CurrencyAmount<Token> | null,
  account: string,
  bridgeProvider: BridgeProviderInfo,
): SwapAndBridgeContext | undefined {
  const swapResultContext = createSwapResultContext(
    winningSolver,
    receivedAmount,
    surplusAmount,
    surplusAmountUsd,
    receivedAmountUsd,
  )

  const sourceChainId = order.inputToken.chainId
  const destinationChainId = order.outputToken.chainId
  const sourceChainData = getChainInfo(sourceChainId)
  const destChainData = bridgeSupportedNetworks?.find((chain) => chain.id === destinationChainId)

  if (!validateChainData(sourceChainData, destChainData)) {
    return undefined
  }

  const { bridgeReceiveAmount, targetAmounts } = calculateBridgeData(
    crossChainOrder,
    order,
    bridgeQuoteAmounts,
    intermediateToken,
  )

  const overview = createOverview(sourceChainData!, destChainData!, order, intermediateToken, targetAmounts)

  /**
   * Swap is finished, but bridging status is not loaded yet
   */
  if (!crossChainOrder || !bridgeReceiveAmount || !overview.targetAmounts) {
    return createPendingContext(overview, bridgeProvider, swapResultContext)
  }

  return processCompleteContext(
    crossChainOrder,
    overview,
    bridgeReceiveAmount,
    account,
    sourceChainId,
    destinationChainId,
    destChainData!,
    bridgeProvider,
    swapResultContext,
  )
}

function useSwapAndBridgeHookData(
  chainId: SupportedChainId,
  order: Order | undefined,
): {
  account: string | undefined
  bridgeSupportedNetworks: ReturnType<typeof useBridgeSupportedNetworks>['data']
  intermediateToken: Token | undefined
  bridgeProvider: BridgeProviderInfo | undefined
  receivedAmount: CurrencyAmount<Currency> | undefined
  receivedAmountUsd: CurrencyAmount<Token> | null
  surplusAmount: CurrencyAmount<Currency> | undefined
  surplusAmountUsd: CurrencyAmount<Token> | null
  crossChainOrder: CrossChainOrder | null
} {
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

  return {
    account,
    bridgeSupportedNetworks,
    intermediateToken,
    bridgeProvider,
    receivedAmount,
    receivedAmountUsd,
    surplusAmount,
    surplusAmountUsd,
    crossChainOrder,
  }
}

function createContextFromData(
  account: string | undefined,
  bridgeProvider: BridgeProviderInfo | undefined,
  winningSolver: SolverCompetition | undefined,
  receivedAmount: CurrencyAmount<Currency> | undefined,
  surplusAmount: CurrencyAmount<Currency> | undefined,
  order: Order | undefined,
  intermediateToken: Token | undefined,
  bridgeSupportedNetworks: ReturnType<typeof useBridgeSupportedNetworks>['data'],
  crossChainOrder: CrossChainOrder | null,
  bridgeQuoteAmounts: BridgeQuoteAmounts | undefined,
  surplusAmountUsd: CurrencyAmount<Token> | null,
  receivedAmountUsd: CurrencyAmount<Token> | null,
): SwapAndBridgeContext | undefined {
  if (!validateContextInputs(account, bridgeProvider, winningSolver, receivedAmount, surplusAmount, order)) {
    return undefined
  }

  if (!intermediateToken) {
    return undefined
  }

  return createContextData(
    order!,
    bridgeSupportedNetworks,
    intermediateToken,
    crossChainOrder,
    bridgeQuoteAmounts,
    winningSolver!,
    receivedAmount!,
    surplusAmount!,
    surplusAmountUsd,
    receivedAmountUsd,
    account!,
    bridgeProvider!,
  )
}

function useSwapAndBridgeContextMemo(
  hookData: ReturnType<typeof useSwapAndBridgeHookData>,
  order: Order | undefined,
  winningSolver: SolverCompetition | undefined,
  bridgeQuoteAmounts?: BridgeQuoteAmounts,
): SwapAndBridgeContext | undefined {
  const {
    account,
    bridgeSupportedNetworks,
    intermediateToken,
    bridgeProvider,
    receivedAmount,
    receivedAmountUsd,
    surplusAmount,
    surplusAmountUsd,
    crossChainOrder,
  } = hookData

  return useMemo(
    () =>
      createContextFromData(
        account,
        bridgeProvider,
        winningSolver,
        receivedAmount,
        surplusAmount,
        order,
        intermediateToken,
        bridgeSupportedNetworks,
        crossChainOrder,
        bridgeQuoteAmounts,
        surplusAmountUsd,
        receivedAmountUsd,
      ),
    [
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
    ],
  )
}

export function useSwapAndBridgeContext(
  chainId: SupportedChainId,
  order: Order | undefined,
  winningSolver: SolverCompetition | undefined,
  bridgeQuoteAmounts?: BridgeQuoteAmounts,
): SwapAndBridgeContext | undefined {
  const hookData = useSwapAndBridgeHookData(chainId, order)

  return useSwapAndBridgeContextMemo(hookData, order, winningSolver, bridgeQuoteAmounts)
}
