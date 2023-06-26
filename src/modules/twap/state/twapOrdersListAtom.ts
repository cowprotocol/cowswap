import { atom } from 'jotai'
import { atomWithStorage } from 'jotai/utils'

import { tokensByAddressAtom } from 'modules/tokensList/state/tokensListAtom'
import { walletInfoAtom } from 'modules/wallet/api/state'

import { OrderWithComposableCowInfo } from 'common/types'
import { deepEqual } from 'utils/deepEqual'

import { TwapOrderItem } from '../types'
import { emulateTwapAsOrder } from '../utils/emulateTwapAsOrder'
import { updateTwapOrdersList } from '../utils/updateTwapOrdersList'

export type TwapOrdersList = { [key: string]: TwapOrderItem }

export const twapOrdersListAtom = atomWithStorage<TwapOrdersList>('twap-orders-list:v4', {})

export const updateTwapOrdersListAtom = atom(null, (get, set, nextState: TwapOrdersList) => {
  const currentState = get(twapOrdersListAtom)
  const newState = updateTwapOrdersList(currentState, nextState)

  if (!deepEqual(currentState, newState)) {
    set(twapOrdersListAtom, newState)
  }
})

export const addTwapOrderToListAtom = atom(null, (get, set, order: TwapOrderItem) => {
  const currentState = get(twapOrdersListAtom)

  set(twapOrdersListAtom, { ...currentState, [order.id]: order })
})

export const emulatedTwapOrdersAtom = atom((get) => {
  const { account, chainId } = get(walletInfoAtom)
  const tokens = get(tokensByAddressAtom)
  const orders = Object.values(get(twapOrdersListAtom))
  const accountLowerCase = account?.toLowerCase()

  if (!accountLowerCase) return []

  const orderWithComposableCowInfo: OrderWithComposableCowInfo[] = orders
    .filter((order) => order.chainId === chainId && order.safeAddress.toLowerCase() === accountLowerCase)
    .map((order) => {
      return {
        order: emulateTwapAsOrder(tokens, order),
        composableCowInfo: {
          id: order.id,
        },
      }
    })

  return orderWithComposableCowInfo
})
