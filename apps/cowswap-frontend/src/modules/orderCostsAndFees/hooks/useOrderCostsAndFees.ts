import { useMemo } from 'react'

import { SWR_NO_REFRESH_OPTIONS, NATIVE_CURRENCIES, WRAPPED_NATIVE_CURRENCIES } from '@cowprotocol/common-const'
import { normalizeError } from '@cowprotocol/common-utils'
import { areAddressesEqual, getAddressKey, isSolanaChain, SupportedChainId } from '@cowprotocol/cow-sdk'
import { Token } from '@cowprotocol/currency'

import useSWR from 'swr'

import { getNativePrice } from 'api/cowProtocol/apiCached'
import { getIsComposableCowChildOrder } from 'utils/orderUtils/getIsComposableCowChildOrder'
import { ParsedOrder } from 'utils/orderUtils/parseOrder'

import { useIsOrderCostsBreakdownEnabled } from './useIsOrderCostsBreakdownEnabled'

import { fetchAllOrderTrades } from '../services/fetchAllOrderTrades.service'
import { OrderCostsAndFeesState, OrderTradesSnapshot } from '../types/orderCostsAndFees.types'
import { getOrderCostsAndFeesState, getSurplusToken } from '../utils/orderCostsAndFeesState.utils'
import { parseIntegerAmount } from '../utils/protocolFees.utils'

const UNAVAILABLE: OrderCostsAndFeesState = { status: 'unavailable' }

export function useOrderCostsAndFees(order: ParsedOrder, chainId: SupportedChainId): OrderCostsAndFeesState {
  const isEnabled = useIsOrderCostsBreakdownEnabled()
  const { gasCost, executedBuyAmount, executedSellAmount } = order.executionData
  const gasCostAmount = gasCost ? parseIntegerAmount(gasCost) : null
  const shouldFetch = isEnabled && !isSolanaChain(chainId) && gasCostAmount !== null && gasCostAmount > 0n
  // ComposableCoW children (TWAP parts) live in the prod order book, like in fetchAndClassifyOrder.
  const env = getIsComposableCowChildOrder(order) ? 'prod' : undefined

  // keepPreviousData keeps the last snapshot on screen while a new fill is fetched; it is only shown for its own order.
  const { data: snapshot, error } = useSWR(
    shouldFetch
      ? ([
          'orderTrades',
          chainId,
          order.id,
          env,
          executedSellAmount.toString(),
          executedBuyAmount.toString(),
          String(gasCostAmount),
        ] as const)
      : null,
    async ([, chain, orderId, orderEnv, sell, buy, gas]): Promise<OrderTradesSnapshot> => ({
      orderId,
      gasCost: BigInt(gas),
      executedSellAmount: BigInt(sell),
      executedBuyAmount: BigInt(buy),
      trades: await fetchAllOrderTrades(chain, orderId, orderEnv),
    }),
    {
      ...SWR_NO_REFRESH_OPTIONS,
      revalidateIfStale: false,
      keepPreviousData: true,
      errorRetryCount: 0,
      onError: (err: unknown) => console.error('[useOrderCostsAndFees] Failed to fetch trades', normalizeError(err)),
    },
  )

  const hasTrades = snapshot?.orderId === order.id && snapshot.trades.length > 0
  const nativePrice = useSurplusTokenNativePrice(order, chainId, hasTrades)

  return useMemo(
    () => (shouldFetch ? getOrderCostsAndFeesState({ order, chainId, snapshot, error, nativePrice }) : UNAVAILABLE),
    [shouldFetch, order, chainId, snapshot, error, nativePrice],
  )
}

function isNativePriceNeeded(surplusToken: Token, chainId: SupportedChainId): boolean {
  return (
    !areAddressesEqual(surplusToken.address, NATIVE_CURRENCIES[chainId].address) &&
    !areAddressesEqual(surplusToken.address, WRAPPED_NATIVE_CURRENCIES[chainId].address)
  )
}

/** `undefined` while loading; `null` when not needed or unavailable. */
function useSurplusTokenNativePrice(
  order: ParsedOrder,
  chainId: SupportedChainId,
  hasTrades: boolean,
): number | null | undefined {
  const surplusToken = getSurplusToken(order)
  const needsNativePrice = hasTrades && isNativePriceNeeded(surplusToken, chainId)

  const { data, error } = useSWR(
    needsNativePrice ? ['surplusTokenNativePrice', chainId, getAddressKey(surplusToken.address)] : null,
    ([, chain, address]) => getNativePrice(chain, address),
    {
      ...SWR_NO_REFRESH_OPTIONS,
      revalidateIfStale: false,
      errorRetryCount: 0,
      onError: (err: unknown) =>
        console.error('[useOrderCostsAndFees] Failed to fetch native price', normalizeError(err)),
    },
  )

  if (!needsNativePrice || error) return null
  if (!data) return undefined

  return data.price ?? null
}
