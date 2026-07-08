import { atom } from 'jotai'

import { jotaiStore } from '@cowprotocol/core'
import { getAddressKey } from '@cowprotocol/cow-sdk'
import { walletInfoAtom } from '@cowprotocol/wallet'

import { observe } from 'jotai-effect'

import { CancellableOrder } from 'common/utils/isOrderCancellable'
import { isOrderOffChainCancellable } from 'common/utils/isOrderOffChainCancellable'

import { tabParamAtom } from '../routes/routes.atom'

export const ordersToCancelAtom = atom<CancellableOrder[]>([])

export const ordersToCancelSetAtom = atom((get) => {
  const ordersToCancel = get(ordersToCancelAtom)

  return new Set(ordersToCancel.map((orderToCancel) => orderToCancel.id))
})

export const updateOrdersToCancelAtom = atom(null, (get, set, nextState: CancellableOrder[]) => {
  set(ordersToCancelAtom, () => {
    return nextState.filter(isOrderOffChainCancellable)
  })
})

export const removeOrdersToCancelAtom = atom(null, (_, set, ordersUids: string[]) => {
  set(ordersToCancelAtom, (prev) => prev.filter((item) => !ordersUids.includes(item.id)))
})

// Reset ordersToCancelAtom every time the network, wallet address or orders table tab change (only while/when
// ordersToCancelAtom is being observed):

const resetOrdersToCancelKeyAtom = atom((get) => {
  const { chainId, account } = get(walletInfoAtom)
  const tab = get(tabParamAtom)

  return [chainId, getAddressKey(account ?? ''), tab].join('::')
})

ordersToCancelAtom.onMount = () => {
  return observe((get, set) => {
    get(resetOrdersToCancelKeyAtom)
    set(ordersToCancelAtom, [])
  }, jotaiStore)
}
