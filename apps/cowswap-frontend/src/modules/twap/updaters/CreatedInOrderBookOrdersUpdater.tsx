import { useAtomValue } from 'jotai'
import { useSetAtom } from 'jotai'
import { useEffect, useMemo } from 'react'

import { isTruthy } from '@cowprotocol/common-utils'
import { EnrichedOrder } from '@cowprotocol/cow-sdk'
import { useIsSafeWallet, useWalletInfo } from '@cowprotocol/wallet'

import { useAsyncMemo } from 'use-async-memo'

import { useAddOrUpdateOrders } from 'legacy/state/orders/hooks'

import { useTokensForOrdersList, getTokensListFromOrders, useSWRProdOrders } from 'modules/orders'

import { useTwapPartOrdersList } from '../hooks/useTwapPartOrdersList'
import { twapOrdersAtom } from '../state/twapOrdersListAtom'
import { TwapPartOrderItem, updatePartOrdersAtom } from '../state/twapPartOrdersAtom'
import { TwapOrderItem } from '../types'
import { mapPartOrderToStoreOrder } from '../utils/mapPartOrderToStoreOrder'

interface TwapOrderInfo {
  item: TwapPartOrderItem
  parent: TwapOrderItem
  order: EnrichedOrder
}

const isVirtualPart = false

/**
 * For complete control of discrete orders created by TWAP, we process them separately from other discrete orders
 * Since WatchTower creates orders only in PROD env, we use useSWRProdOrders()
 * To distinguish parts settled in order-book from other parts, we mark them by isSettledInOrderBook flag
 */
// TODO: Break down this large function into smaller functions
// TODO: Add proper return type annotation
// eslint-disable-next-line max-lines-per-function, @typescript-eslint/explicit-function-return-type
export function CreatedInOrderBookOrdersUpdater() {
  const { chainId } = useWalletInfo()
  const isSafeWallet = useIsSafeWallet()
  const prodOrders = useSWRProdOrders()
  const getTokensForOrdersList = useTokensForOrdersList()
  const twapPartOrdersList = useTwapPartOrdersList()
  const twapOrders = useAtomValue(twapOrdersAtom)
  const updatePartOrders = useSetAtom(updatePartOrdersAtom)
  const addOrUpdateOrders = useAddOrUpdateOrders()

  const twapPartOrdersMap = useMemo(() => {
    return twapPartOrdersList.reduce<{ [id: string]: TwapPartOrderItem }>((acc, val) => {
      acc[val.uid] = val
      return acc
    }, {})
  }, [twapPartOrdersList])

  // Take only orders related to TWAP from prod API response
  const partOrdersFromProd = useAsyncMemo(
    async () => {
      const ordersInfo = prodOrders.reduce<TwapOrderInfo[]>((acc, order) => {
        const item = twapPartOrdersMap[order.uid]
        const parent = twapOrders[item?.twapOrderId]

        if (parent) {
          acc.push({
            item,
            parent,
            order,
          })
        }

        return acc
      }, [])

      const allTokens = await getTokensForOrdersList(getTokensListFromOrders(ordersInfo))

      return ordersInfo
        .map(({ item, parent, order }) => {
          return mapPartOrderToStoreOrder(item, order, isVirtualPart, parent, allTokens)
        })
        .filter(isTruthy)
    },
    [prodOrders, twapPartOrdersMap, getTokensForOrdersList, twapOrders],
    [],
  )

  useEffect(() => {
    if (!partOrdersFromProd.length) return

    const createdInOrderBookOrders = partOrdersFromProd.reduce<{
      [orderId: string]: Pick<TwapPartOrderItem, 'isCreatedInOrderBook'>
    }>((acc, order) => {
      acc[order.id] = { isCreatedInOrderBook: true }

      return acc
    }, {})

    updatePartOrders(createdInOrderBookOrders)
    addOrUpdateOrders({ orders: partOrdersFromProd, chainId, isSafeWallet })
  }, [chainId, partOrdersFromProd, addOrUpdateOrders, updatePartOrders, isSafeWallet])

  return null
}
