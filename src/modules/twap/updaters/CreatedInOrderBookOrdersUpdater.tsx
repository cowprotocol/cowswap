import { useAtomValue } from 'jotai'
import { useSetAtom } from 'jotai'
import { useEffect, useMemo } from 'react'

import { Order } from 'legacy/state/orders/actions'
import { useAddOrUpdateOrders } from 'legacy/state/orders/hooks'

import { useSWRProdOrders } from 'modules/orders/hooks/useSWRProdOrders'
import { tokensByAddressAtom } from 'modules/tokensList/state/tokensListAtom'
import { useWalletInfo } from 'modules/wallet'

import { twapOrdersAtom } from '../state/twapOrdersListAtom'
import { TwapPartOrderItem, twapPartOrdersListAtom, updatePartOrdersAtom } from '../state/twapPartOrdersAtom'
import { mapPartOrderToStoreOrder } from '../utils/mapPartOrderToStoreOrder'

const isVirtualPart = false

/**
 * For complete control of discrete orders created by TWAP, we process them separately from other discrete orders
 * Since WatchTower creates orders only in PROD env, we use useSWRProdOrders()
 * To distinguish parts settled in order-book from other parts, we mark them by isSettledInOrderBook flag
 */
export function CreatedInOrderBookOrdersUpdater() {
  const { chainId } = useWalletInfo()
  const prodOrders = useSWRProdOrders()
  const tokensByAddress = useAtomValue(tokensByAddressAtom)
  const twapPartOrdersList = useAtomValue(twapPartOrdersListAtom)
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
  const partOrdersFromProd = useMemo(() => {
    return prodOrders.reduce<Order[]>((acc, enrichedOrder) => {
      const item = twapPartOrdersMap[enrichedOrder.uid]
      const parent = twapOrders[item?.twapOrderId]

      if (parent) {
        const storeOrder = mapPartOrderToStoreOrder(item, enrichedOrder, isVirtualPart, parent, tokensByAddress)

        acc.push(storeOrder)
      }

      return acc
    }, [])
  }, [prodOrders, twapPartOrdersMap, tokensByAddress, twapOrders])

  useEffect(() => {
    if (!partOrdersFromProd.length) return

    const createdInOrderBookOrders = partOrdersFromProd.reduce<{
      [orderId: string]: Pick<TwapPartOrderItem, 'isCreatedInOrderBook'>
    }>((acc, order) => {
      acc[order.id] = { isCreatedInOrderBook: true }

      return acc
    }, {})

    updatePartOrders(createdInOrderBookOrders)
    addOrUpdateOrders({ orders: partOrdersFromProd, chainId })
  }, [chainId, partOrdersFromProd, addOrUpdateOrders, updatePartOrders])

  return null
}
