import { useCallback, useMemo, useState } from 'react'

import { getChainInfo, getRpcProvider } from '@cowprotocol/common-const'
import { useInterval } from '@cowprotocol/common-hooks'
import { SupportedChainId, BridgeStatus, CrossChainOrder } from '@cowprotocol/cow-sdk'
import { useTokensByAddressMap } from '@cowprotocol/tokens'
import { useWalletInfo } from '@cowprotocol/wallet'
import { CurrencyAmount } from '@uniswap/sdk-core'

import { useBridgeSupportedNetworks } from 'entities/bridgeProvider'
import ms from 'ms.macro'
import { bridgingSdk } from 'tradingSdk/bridgingSdk'

import type { Order } from 'legacy/state/orders/actions'

import type { SolverCompetition } from 'modules/orderProgressBar'
import { useUsdAmount } from 'modules/usdAmount'

import { getExecutedSummaryData } from 'utils/getExecutedSummaryData'

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
}

const BRIDGE_TRANSACTION_POLLING_INTERVAL = ms`3s`

export function useSwapAndBridgeContext(
  chainId: SupportedChainId,
  order: Order | undefined,
  winningSolver: SolverCompetition | undefined,
): SwapAndBridgeContext | undefined {
  const [crossChainOrder, setCrossChainOrder] = useState<CrossChainOrder | null>(null)

  const { account } = useWalletInfo()
  const bridgeProvider = useMemo(() => {
    const fullAppData = order?.apiAdditionalInfo?.fullAppData
    if (!fullAppData) return

    return bridgingSdk.getProviderFromAppData(fullAppData)?.info
  }, [order])

  const { data: bridgeSupportedNetworks } = useBridgeSupportedNetworks()
  const tokensByAddress = useTokensByAddressMap()

  const { formattedSwappedAmount: receivedAmount, surplusAmount } =
    useMemo(() => {
      return order ? getExecutedSummaryData(order) : undefined
    }, [order]) || {}

  const receivedAmountUsd = useUsdAmount(receivedAmount).value
  const surplusAmountUsd = useUsdAmount(surplusAmount).value

  const updateBridgeOrderData = useCallback(async () => {
    const rpcProvider = getRpcProvider(chainId)

    if (!order?.fullAppData || !rpcProvider) return

    const crossChainOrder = await bridgingSdk.getOrder({
      chainId,
      orderId: order.id,
      rpcProvider,
    })

    setCrossChainOrder(crossChainOrder)
  }, [chainId, order])

  useInterval(updateBridgeOrderData, BRIDGE_TRANSACTION_POLLING_INTERVAL, true)

  return useMemo(() => {
    if (!account || !bridgeProvider || !winningSolver || !receivedAmount || !surplusAmount || !order) return undefined

    const swapResultContext: SwapResultContext = {
      winningSolver,
      receivedAmount,
      surplusAmount,
      surplusAmountUsd,
      receivedAmountUsd,
    }

    const destinationChainId = order.outputToken.chainId
    const sourceChainData = getChainInfo(order.inputToken.chainId)
    const destChainData = bridgeSupportedNetworks?.find((chain) => chain.id === destinationChainId)

    const intermediateToken = tokensByAddress[order.buyToken.toLowerCase()]

    if (!sourceChainData || !intermediateToken || !destChainData) return undefined

    const bridgeReceiveAmount =
      !!crossChainOrder &&
      CurrencyAmount.fromRawAmount(order.outputToken, crossChainOrder.bridgingParams.outputAmount.toString())

    const overview: SwapAndBridgeOverview = {
      sourceChainName: sourceChainData.name,
      targetChainName: destChainData.label,
      sourceAmounts: {
        sellAmount: CurrencyAmount.fromRawAmount(order.inputToken, order.sellAmount),
        buyAmount: CurrencyAmount.fromRawAmount(intermediateToken, order.buyAmount),
      },
      targetAmounts:
        crossChainOrder && bridgeReceiveAmount
          ? {
              sellAmount: CurrencyAmount.fromRawAmount(
                intermediateToken,
                crossChainOrder.bridgingParams.inputAmount.toString(),
              ),
              buyAmount: bridgeReceiveAmount,
            }
          : undefined,
    }

    if (!crossChainOrder || !bridgeReceiveAmount || !overview.targetAmounts) {
      return {
        bridgingStatus: SwapAndBridgeStatus.DEFAULT,
        overview,
        bridgeProvider,
        swapResultContext,
      }
    }

    const status = crossChainOrder.status
    const bridgingStatus = status ? bridgeStatusMap[status] : SwapAndBridgeStatus.DEFAULT

    const bridgingProgressContext: BridgingProgressContext = {
      account,
      isFailed: status === BridgeStatus.EXPIRED,
      isRefunded: status === BridgeStatus.REFUND,
      receivedAmount: status === BridgeStatus.EXECUTED ? bridgeReceiveAmount : undefined,
      receivedAmountUsd: undefined,
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
    }
  }, [
    order,
    account,
    bridgeProvider,
    winningSolver,
    receivedAmount,
    receivedAmountUsd,
    surplusAmount,
    surplusAmountUsd,
    crossChainOrder,
    bridgeSupportedNetworks,
    tokensByAddress,
  ])
}
