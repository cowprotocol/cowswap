import { atom } from 'jotai'
import { atomWithStorage } from 'jotai/utils'

import { tokensByAddressAtom } from 'modules/tokensList/state/tokensListAtom'
import { walletInfoAtom } from 'modules/wallet/api/state'

import { OrderWithComposableCowInfo } from 'common/types'
import { deepEqual } from 'utils/deepEqual'

import { TwapOrderItem } from '../types'
import { emulateTwapAsOrder } from '../utils/emulateTwapAsOrder'

export type TwapOrdersList = { [key: string]: TwapOrderItem }

export const twapOrdersListAtom = atomWithStorage<TwapOrdersList>('twap-orders-list:v3', {})

export const updateTwapOrdersListAtom = atom(null, (get, set, nextState: TwapOrdersList) => {
  const currentState = get(twapOrdersListAtom)

  if (!deepEqual(currentState, nextState)) {
    set(twapOrdersListAtom, nextState)
  }
})

export const emulatedTwapOrdersAtom = atom((get) => {
  const { account, chainId } = get(walletInfoAtom)
  const tokens = get(tokensByAddressAtom)
  const orders = Object.values(get(twapOrdersListAtom))
  const accountLowerCase = account?.toLowerCase()

  if (!accountLowerCase) return []

  return orders
    .filter((order) => order.chainId === chainId && order.safeAddress.toLowerCase() === accountLowerCase)
    .map((order) => {
      return {
        order: emulateTwapAsOrder(tokens, order),
        composableCowInfo: {
          uid: order.id,
        },
      }
    }) as OrderWithComposableCowInfo[]
})
