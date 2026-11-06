import { useMemo } from 'react'

import { formatUnits } from 'viem'

import { areAddressesEqual } from '@cowprotocol/cow-sdk'
import {
  type BaseOrderLifecyclePayload,
  type CowWidgetEventListeners,
  CowWidgetEvents,
  type OnCancelledOrderPayload,
} from '@cowprotocol/events'

import { type RwaAsset } from '@/entities/asset'
import { type RwaAnalyticsEvents, trackEvent } from '@/shared/lib/analytics'

type OrderParams = RwaAnalyticsEvents['swap_expired']

/** Widget listeners that send the order lifecycle to GTM, under the event names CoW Swap uses */
export function useWidgetOrderAnalytics(asset: RwaAsset): CowWidgetEventListeners {
  return useMemo(() => {
    const { ticker } = asset
    const isAssetToken = (chainId: number, address: string): boolean =>
      asset.tokens.some((token) => token.chainId === chainId && areAddressesEqual(token.address, address))

    return [
      {
        event: CowWidgetEvents.ON_POSTED_ORDER,
        handler: (payload) => {
          trackEvent('order_submitted', {
            ticker,
            side: isAssetToken(payload.chainId, payload.outputToken.address) ? 'buy' : 'sell',
            orderId: payload.orderUid,
            chainId: payload.chainId,
            orderType: payload.orderType,
            kind: payload.kind,
            walletAddress: payload.owner,
            sellToken: payload.inputToken.address,
            buyToken: payload.outputToken.address,
            sellTokenSymbol: payload.inputToken.symbol,
            buyTokenSymbol: payload.outputToken.symbol,
            sellAmountUnits: formatUnits(payload.inputAmount, payload.inputToken.decimals),
            buyAmountUnits: formatUnits(payload.outputAmount, payload.outputToken.decimals),
            isEoaTwap: payload.isEoaTwap,
          })
        },
      },
      {
        event: CowWidgetEvents.ON_FULFILLED_ORDER,
        handler: (payload) => {
          trackEvent('swap_executed', {
            ...getOrderParams(ticker, payload),
            executedSellAmount: payload.order.executedSellAmount,
            executedBuyAmount: payload.order.executedBuyAmount,
          })
        },
      },
      {
        event: CowWidgetEvents.ON_CANCELLED_ORDER,
        handler: (payload) => trackEvent('swap_cancelled', getCancelledOrderParams(ticker, payload)),
      },
      {
        event: CowWidgetEvents.ON_EXPIRED_ORDER,
        handler: (payload) => trackEvent('swap_expired', getOrderParams(ticker, payload)),
      },
    ]
  }, [asset])
}

function getCancelledOrderParams(ticker: string, payload: OnCancelledOrderPayload): OrderParams {
  const params = getOrderParams(ticker, payload)

  return {
    ...params,
    orderId: payload.analyticsOrderId ?? params.orderId,
    walletAddress: payload.analyticsWalletAddress ?? params.walletAddress,
    isEoaTwap: payload.isEoaTwap,
  }
}

function getOrderParams(ticker: string, { chainId, orderType, order }: BaseOrderLifecyclePayload): OrderParams {
  return {
    ticker,
    orderId: order.uid,
    chainId,
    orderType,
    walletAddress: order.owner,
    sellToken: order.sellToken,
    buyToken: order.buyToken,
  }
}
