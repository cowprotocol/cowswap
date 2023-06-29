import { atom } from 'jotai'
import { atomWithStorage } from 'jotai/utils'

import { OrderParameters, SupportedChainId } from '@cowprotocol/cow-sdk'

import deepEqual from 'fast-deep-equal'

import { walletInfoAtom } from 'modules/wallet/api/state'

export interface TwapPartOrderItem {
  uid: string
  chainId: SupportedChainId
  safeAddress: string
  twapOrderId: string
  order: OrderParameters
  signature: string
}
export type TwapPartOrders = { [twapOrderHash: string]: TwapPartOrderItem }

export const twapPartOrdersAtom = atomWithStorage<TwapPartOrders>('twap-part-orders-list:v1', {})

export const updateTwapPartOrdersAtom = atom(null, (get, set, nextState: TwapPartOrders) => {
  const currentState = get(twapPartOrdersAtom)

  if (!deepEqual(currentState, nextState)) {
    set(twapPartOrdersAtom, nextState)
  }
})

export const twapPartOrdersListAtom = atom<TwapPartOrderItem[]>((get) => {
  const { account, chainId } = get(walletInfoAtom)

  if (!account || !chainId) return []

  const accountLowerCase = account.toLowerCase()

  return Object.values(get(twapPartOrdersAtom)).filter(
    (order) => order.safeAddress === accountLowerCase && order.chainId === chainId
  )
})
