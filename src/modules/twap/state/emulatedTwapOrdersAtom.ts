import { atom } from 'jotai'

import { Order } from 'legacy/state/orders/actions'

import { tokensByAddressAtom } from 'modules/tokensList/state/tokensListAtom'
import { walletInfoAtom } from 'modules/wallet/api/state'

import { openTwapOrdersAtom } from './twapOrdersListAtom'

import { mapTwapOrderToStoreOrder } from '../utils/mapTwapOrderToStoreOrder'

export const emulatedTwapOrdersAtom = atom<Order[]>((get) => {
  const { account, chainId } = get(walletInfoAtom)
  const openOrders = get(openTwapOrdersAtom)
  const tokensByAddress = get(tokensByAddressAtom)
  const accountLowerCase = account?.toLowerCase()

  if (!accountLowerCase) return []

  return openOrders
    .filter((order) => order.chainId === chainId && order.safeAddress.toLowerCase() === accountLowerCase)
    .map((order) => {
      return mapTwapOrderToStoreOrder(order, tokensByAddress)
    })
})
