import { atom } from 'jotai'
import { atomWithStorage } from 'jotai/utils'

import { OrderParameters, SupportedChainId } from '@cowprotocol/cow-sdk'

import { walletInfoAtom } from 'modules/wallet/api/state'

export interface TwapParticleOrderItem {
  uid: string
  chainId: SupportedChainId
  safeAddress: string
  twapOrderId: string
  order: OrderParameters
  signature: string
}
export type TwapParticleOrders = { [twapOrderHash: string]: TwapParticleOrderItem }

export const twapParticleOrdersAtom = atomWithStorage<TwapParticleOrders>('twap-particle-orders-list:v1', {})

export const twapParticleOrdersListAtom = atom((get) => {
  const { account, chainId } = get(walletInfoAtom)

  if (!account || !chainId) return []

  const accountLowerCase = account.toLowerCase()

  return Object.values(get(twapParticleOrdersAtom)).filter(
    (order) => order.safeAddress === accountLowerCase && order.chainId === chainId
  )
})
