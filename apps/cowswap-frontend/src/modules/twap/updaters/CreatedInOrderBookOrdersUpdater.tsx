import { useSetAtom } from 'jotai'
import { useEffect } from 'react'

import { useIsSafeWallet, useWalletInfo } from '@cowprotocol/wallet'

import { useAddOrUpdateOrders } from 'legacy/state/orders/hooks'

import { useCreatedInOrderBookPartOrders } from '../hooks/useCreatedInOrderBookPartOrders'
import { TwapPartOrderItem, updatePartOrdersAtom } from '../state/twapPartOrdersAtom'
import { updateTwapPartOrdersCacheAtom } from '../state/twapPartOrdersCacheAtom'

/**
 * For complete control of discrete orders created by TWAP, we process them separately from other discrete orders
 * Since WatchTower creates orders only in PROD env, we use useSWRProdOrders()
 * To distinguish parts settled in order-book from other parts, we mark them by isSettledInOrderBook flag
 */
export function CreatedInOrderBookOrdersUpdater(): null {
  const { chainId, account } = useWalletInfo()
  const isSafeWallet = useIsSafeWallet()
  const updatePartOrders = useSetAtom(updatePartOrdersAtom)
  const updateTwapPartOrdersCache = useSetAtom(updateTwapPartOrdersCacheAtom)
  const addOrUpdateOrders = useAddOrUpdateOrders()

  const { orders: partOrders, cacheEntries: partOrdersCacheEntries } = useCreatedInOrderBookPartOrders({
    chainId,
    owner: account?.toLowerCase(),
  })

  useEffect(() => {
    if (!chainId || !account) return
    if (!Object.keys(partOrdersCacheEntries).length) return
    updateTwapPartOrdersCache({
      chainId,
      owner: account?.toLowerCase(),
      entries: partOrdersCacheEntries,
    })
  }, [chainId, account, partOrdersCacheEntries, updateTwapPartOrdersCache])

  useEffect(() => {
    if (!partOrders.length) return

    const createdInOrderBookOrders = partOrders.reduce<{
      [orderId: string]: Pick<TwapPartOrderItem, 'isCreatedInOrderBook'>
    }>((acc, order) => {
      acc[order.id] = { isCreatedInOrderBook: true }

      return acc
    }, {})

    updatePartOrders(createdInOrderBookOrders)
    addOrUpdateOrders({ orders: partOrders, chainId, isSafeWallet })
  }, [chainId, partOrders, addOrUpdateOrders, updatePartOrders, isSafeWallet])

  return null
}
