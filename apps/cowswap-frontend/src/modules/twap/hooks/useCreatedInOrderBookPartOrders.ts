import { useAtomValue } from 'jotai'
import { useMemo } from 'react'

import { isTruthy } from '@cowprotocol/common-utils'
import { EnrichedOrder, SupportedChainId } from '@cowprotocol/cow-sdk'

import { twapOrdersAtom } from 'entities/twap'
import { useAsyncMemo } from 'use-async-memo'

import { Order } from 'legacy/state/orders/actions'

import { getTokensListFromOrders, useSWRProdOrders, useTokensForOrdersList } from 'modules/orders'

import { useTwapPartOrdersList } from './useTwapPartOrdersList'

import { TWAP_FINAL_STATUSES } from '../const'
import { EMPTY_CACHE, useTwapPartOrdersCache } from '../hooks/useTwapPartOrdersCache'
import { TwapPartOrderItem } from '../state/twapPartOrdersAtom'
import { TwapPartOrdersCacheByUid } from '../state/twapPartOrdersCacheAtom'
import { TwapOrderItem } from '../types'
import { fetchMissingPartOrders } from '../updaters/fetchMissingPartOrders'
import { mapPartOrderToStoreOrder } from '../utils/mapPartOrderToStoreOrder'

interface TwapOrderInfo {
  item: TwapPartOrderItem
  parent: TwapOrderItem
  order: EnrichedOrder
}

interface UseCreatedInOrderBookPartOrdersParams {
  chainId: SupportedChainId | undefined
  owner: string | undefined
}

export interface UseCreatedInOrderBookPartOrdersResult {
  orders: Order[]
  cacheEntries: TwapPartOrdersCacheByUid
}

const isVirtualPart = false
const EMPTY_RESULT: UseCreatedInOrderBookPartOrdersResult = {
  orders: [],
  cacheEntries: EMPTY_CACHE,
}

export function useCreatedInOrderBookPartOrders({
  chainId,
  owner,
}: UseCreatedInOrderBookPartOrdersParams): UseCreatedInOrderBookPartOrdersResult {
  const prodOrders = useSWRProdOrders()
  const getTokensForOrdersList = useTokensForOrdersList()
  const twapPartOrdersList = useTwapPartOrdersList()
  const twapOrders = useAtomValue(twapOrdersAtom)
  const { cacheByUid, cachedFinalizedTwapOrderIds } = useTwapPartOrdersCache()
  const twapPartOrdersMap = useMemo(() => {
    return twapPartOrdersList.reduce<Record<string, TwapPartOrderItem>>((acc, val) => {
      acc[val.uid] = val
      return acc
    }, {})
  }, [twapPartOrdersList])

  return useAsyncMemo(
    async () => {
      if (!chainId || !owner) return EMPTY_RESULT
      const ordersFromProdByUid = prodOrders.reduce<Record<string, EnrichedOrder>>((acc, order) => {
        acc[order.uid] = order
        return acc
      }, {})
      const existingOrdersByUid = Object.entries(cacheByUid).reduce<Record<string, EnrichedOrder>>(
        (acc, [uid, entry]) => {
          acc[uid] = entry.enrichedOrder
          return acc
        },
        ordersFromProdByUid,
      )
      const partOrderIds = Object.keys(twapPartOrdersMap)
      const partOrderIdsToCheck = partOrderIds.filter((uid) => {
        return !cachedFinalizedTwapOrderIds.has(twapPartOrdersMap[uid].twapOrderId)
      })
      const fallbackOrders = partOrderIdsToCheck.length
        ? await fetchMissingPartOrders(chainId, owner, partOrderIdsToCheck, existingOrdersByUid)
        : []
      const allOrdersByUid = fallbackOrders.reduce<Record<string, EnrichedOrder>>(
        (acc, order) => {
          acc[order.uid] = order
          return acc
        },
        { ...existingOrdersByUid },
      )

      const ordersInfo = partOrderIds.reduce<TwapOrderInfo[]>((acc, uid) => {
        const order = allOrdersByUid[uid]
        const item = twapPartOrdersMap[uid]
        const parent = twapOrders[item?.twapOrderId]

        if (order && parent) {
          acc.push({ item, parent, order })
        }

        return acc
      }, [])
      const allTokens = await getTokensForOrdersList(getTokensListFromOrders(ordersInfo))
      const cacheEntries = ordersInfo.reduce<TwapPartOrdersCacheByUid>((acc, { item, parent, order }) => {
        if (!TWAP_FINAL_STATUSES.includes(parent.status)) return acc

        acc[item.uid] = {
          twapOrderId: item.twapOrderId,
          enrichedOrder: order,
        }

        return acc
      }, {})
      const orders = ordersInfo
        .map(({ item, parent, order }) => mapPartOrderToStoreOrder(item, order, isVirtualPart, parent, allTokens))
        .filter(isTruthy)

      return { orders, cacheEntries }
    },
    [
      chainId,
      owner,
      prodOrders,
      twapPartOrdersMap,
      cacheByUid,
      cachedFinalizedTwapOrderIds,
      getTokensForOrdersList,
      twapOrders,
    ],
    EMPTY_RESULT,
  )
}
