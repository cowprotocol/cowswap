import { atom } from 'jotai'
import { atomWithStorage } from 'jotai/utils'

import { walletInfoAtom } from 'modules/wallet/api/state'

import { deepEqual } from 'utils/deepEqual'

import { TwapOrderItem } from '../types'
import { updateTwapOrdersList } from '../utils/updateTwapOrdersList'

export type TwapOrdersList = { [key: string]: TwapOrderItem }

export const twapOrdersAtom = atomWithStorage<TwapOrdersList>('twap-orders-list:v5', {})

export const twapOrdersListAtom = atom<TwapOrderItem[]>((get) => {
  const { account, chainId } = get(walletInfoAtom)

  if (!account || !chainId) return []

  const accountLowerCase = account.toLowerCase()

  const orders = Object.values(get(twapOrdersAtom))

  return orders
    .flat()
    .filter((order) => order.safeAddress.toLowerCase() === accountLowerCase && order.chainId === chainId)
})

export const updateTwapOrdersListAtom = atom(null, (get, set, nextState: TwapOrdersList) => {
  const currentState = get(twapOrdersAtom)
  const newState = updateTwapOrdersList(currentState, nextState)

  if (!deepEqual(currentState, newState)) {
    set(twapOrdersAtom, newState)
  }
})

export const addTwapOrderToListAtom = atom(null, (get, set, order: TwapOrderItem) => {
  const currentState = get(twapOrdersAtom)

  set(twapOrdersAtom, { ...currentState, [order.id]: order })
})
