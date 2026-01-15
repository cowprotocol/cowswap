import { atom } from 'jotai'

import { walletInfoAtom } from '@cowprotocol/wallet'

import type { TwapOrderItem } from 'modules/twap'

import { twapOrdersAtom } from './twapOrdersAtom'

export const twapOrdersListAtom = atom<TwapOrderItem[]>((get) => {
  const { account, chainId } = get(walletInfoAtom)

  if (!account || !chainId) return []

  const accountLowerCase = account.toLowerCase()

  const orders = Object.values(get(twapOrdersAtom))

  return orders
    .flat()
    .filter((order) => order.safeAddress.toLowerCase() === accountLowerCase && order.chainId === chainId)
})
