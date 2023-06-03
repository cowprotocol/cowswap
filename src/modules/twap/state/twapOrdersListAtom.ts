import { atom } from 'jotai'
import { atomWithStorage } from 'jotai/utils'

import { tokensByAddressAtom } from 'modules/tokensList/state/tokensListAtom'

import { TWAPOrderItem } from '../types'
import { parsePendingTwapOrder } from '../utils/parsePendingTwapOrder'

export const twapOrdersListAtom = atomWithStorage<TWAPOrderItem[]>('twap-orders-list:v1', [])

export const twapOrdersHashesAtom = atom((get) => {
  const state = get(twapOrdersListAtom)

  return state.reduce((acc, item) => {
    acc[item.hash] = item
    return acc
  }, {} as { [key: string]: TWAPOrderItem })
})

export const parsedTwapOrdersAtom = atom((get) => {
  const tokens = get(tokensByAddressAtom)
  const orders = get(twapOrdersListAtom)

  return orders.map((order) => parsePendingTwapOrder(tokens, order))
})

export const addTwapOrdersInListAtom = atom(null, (get, set, orders: TWAPOrderItem[]) => {
  set(twapOrdersListAtom, () => {
    const hashesMap = get(twapOrdersHashesAtom)
    const prevState = get(twapOrdersListAtom)
    const filterOrders = orders.filter((order) => !hashesMap[order.hash])

    return [...prevState, ...filterOrders]
  })
})
