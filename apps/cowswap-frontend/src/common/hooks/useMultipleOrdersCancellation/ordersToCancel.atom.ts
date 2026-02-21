import { atom } from 'jotai'

import { jotaiStore } from '@cowprotocol/core'
import { walletInfoAtom } from '@cowprotocol/wallet'

import { observe } from 'jotai-effect'

import { tabParamAtom } from 'modules/ordersTable/state/params/ordersTableParams.atoms'

import { CancellableOrder } from 'common/utils/isOrderCancellable'
import { isOrderOffChainCancellable } from 'common/utils/isOrderOffChainCancellable'

export const ordersToCancelAtom = atom<CancellableOrder[]>([])

export const ordersToCancelMapAtom = atom((get) => {
  const ordersToCancel = get(ordersToCancelAtom)

  return ordersToCancel.reduce((acc, orderToCancel) => {
    acc[orderToCancel.id] = true

    return acc
  }, {} as Record<string, true>)
})

export const updateOrdersToCancelAtom = atom(null, (get, set, nextState: CancellableOrder[]) => {
  set(ordersToCancelAtom, () => {
    return nextState.filter(isOrderOffChainCancellable)
  })
})

export const removeOrdersToCancelAtom = atom(null, (get, set, ordersUids: string[]) => {
  set(ordersToCancelAtom, () => {
    const state = get(ordersToCancelAtom)

    return state.filter((item) => !ordersUids.includes(item.id))
  })
})

// Reset ordersLimitAtom every time the network or the wallet address change, and make sure we are only observing
// walletKeyAtom if we are also observing ordersLimitAtom.

const resetOrdersToCancelKeyAtom = atom((get) => {
  const { chainId, account } = get(walletInfoAtom)
  const tab = get(tabParamAtom)

  return [chainId, account, tab].join('::')
})

ordersToCancelAtom.onMount = () => {
  // TODO: This might not be needed at all:
  let prevResetOrdersToCancelKey = ''

  return observe((get, set) => {
    const resetOrdersToCancelKey = get(resetOrdersToCancelKeyAtom)

    if (prevResetOrdersToCancelKey !== resetOrdersToCancelKey) {
      prevResetOrdersToCancelKey = resetOrdersToCancelKey
      set(ordersToCancelAtom, [])
    }
  }, jotaiStore)
}
