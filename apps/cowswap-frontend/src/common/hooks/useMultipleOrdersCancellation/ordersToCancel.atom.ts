import { atom } from 'jotai'

import { CancellableOrder } from 'common/utils/isOrderCancellable'
import { isOrderOffChainCancellable } from 'common/utils/isOrderOffChainCancellable'
import { ordersTableFiltersAtom } from 'modules/ordersTable/state/ordersTable.atoms'
import { walletInfoAtom } from '../../../../../../libs/wallet/src/api/state'
import { jotaiStore } from '@cowprotocol/core'
import { observe } from 'jotai-effect'

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
  const { currentTabId } = get(ordersTableFiltersAtom)

  return [chainId, account, currentTabId].join("::");
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
