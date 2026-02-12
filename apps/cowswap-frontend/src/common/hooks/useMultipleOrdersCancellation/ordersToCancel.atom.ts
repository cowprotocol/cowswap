import { atom } from 'jotai'

import { jotaiStore } from '@cowprotocol/core'
import { walletInfoAtom } from '@cowprotocol/wallet'

import { observe } from 'jotai-effect'

import { ordersTableURLParamsAtom } from 'modules/ordersTable/state/ordersTable.atoms'
import { OrderTabId } from 'modules/ordersTable/state/tabs/ordersTableTabs.constants'

import { CancellableOrder } from 'common/utils/isOrderCancellable'
import { isOrderOffChainCancellable } from 'common/utils/isOrderOffChainCancellable'

export const ordersToCancelAtom = atom<CancellableOrder[]>([])

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
  const ordersTableURLParams = get(ordersTableURLParamsAtom)
  const currentTabId = ordersTableURLParams.tab || OrderTabId.open;

  return [chainId, account, currentTabId].join('::')
})

ordersToCancelAtom.onMount = () => {
  let prevResetOrdersToCancelKey = ''

  return observe((get, set) => {
    const resetOrdersToCancelKey = get(resetOrdersToCancelKeyAtom)

    if (prevResetOrdersToCancelKey !== resetOrdersToCancelKey) {
      prevResetOrdersToCancelKey = resetOrdersToCancelKey
      set(ordersToCancelAtom, [])
    }
  }, jotaiStore)
}
