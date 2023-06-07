import { atom } from 'jotai'
import { atomWithStorage } from 'jotai/utils'

import { OrderParameters, SupportedChainId } from '@cowprotocol/cow-sdk'

import { walletInfoAtom } from 'modules/wallet/api/state'

export interface TwapDiscreteOrderItem {
  uid: string
  chainId: SupportedChainId
  safeAddress: string
  twapOrderId: string
  order: OrderParameters
  signature: string
}
export type TwapDiscreteOrders = { [twapOrderHash: string]: TwapDiscreteOrderItem }

export const twapDiscreteOrdersAtom = atomWithStorage<TwapDiscreteOrders>('twap-discrete-orders-list:v2', {})

export const twapDiscreteOrdersListAtom = atom((get) => {
  const { account, chainId } = get(walletInfoAtom)

  if (!account || !chainId) return []

  const accountLowerCase = account.toLowerCase()

  return Object.values(get(twapDiscreteOrdersAtom)).filter(
    (order) => order.safeAddress === accountLowerCase && order.chainId === chainId
  )
})
