import { atom } from 'jotai'
import { atomWithStorage } from 'jotai/utils'

import { OrderParameters, SupportedChainId } from '@cowprotocol/cow-sdk'

import { walletInfoAtom } from 'modules/wallet/api/state'

export interface TwapPartOrderItem {
  uid: string
  index: number
  chainId: SupportedChainId
  safeAddress: string
  twapOrderId: string
  order: OrderParameters
}
export type TwapPartOrders = { [twapOrderHash: string]: TwapPartOrderItem[] }

export const twapPartOrdersAtom = atomWithStorage<TwapPartOrders>('twap-part-orders-list:v3', {})

export const twapPartOrdersListAtom = atom<TwapPartOrderItem[]>((get) => {
  const { account, chainId } = get(walletInfoAtom)

  if (!account || !chainId) return []

  const accountLowerCase = account.toLowerCase()

  const orders = Object.values(get(twapPartOrdersAtom))

  return orders.flat().filter((order) => order.safeAddress === accountLowerCase && order.chainId === chainId)
})
