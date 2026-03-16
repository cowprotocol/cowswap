import { atom } from 'jotai'

import { areAddressesEqual } from '@cowprotocol/cow-sdk'
import { walletInfoAtom } from '@cowprotocol/wallet'

import type { TwapOrderItem } from 'modules/twap'

import { twapOrdersAtom } from './twapOrdersAtom'

export const twapOrdersListAtom = atom<TwapOrderItem[]>((get) => {
  const { account, chainId } = get(walletInfoAtom)

  if (!account || !chainId) return []

  const orders = Object.values(get(twapOrdersAtom))

  return orders.flat().filter((order) => areAddressesEqual(order.safeAddress, account) && order.chainId === chainId)
})
