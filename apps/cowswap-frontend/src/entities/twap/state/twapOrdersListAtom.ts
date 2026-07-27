import { atom } from 'jotai'

import { areAddressesEqual } from '@cowprotocol/cow-sdk'
import { walletInfoAtom } from '@cowprotocol/wallet'

import type { TwapOrderItem } from 'modules/twap'

import { eoaTwapOrdersAtom } from './eoaTwapOrdersAtom'
import { twapOrdersAtom } from './twapOrdersAtom'

export const twapOrdersListAtom = atom<TwapOrderItem[]>((get) => {
  const { account, chainId } = get(walletInfoAtom)

  if (!account || !chainId) return []

  const indexedEoaOrders = Object.values(get(eoaTwapOrdersAtom))
  const indexedEoaHashes = new Set(indexedEoaOrders.flatMap(({ hash }) => (hash ? [hash] : [])))
  const cachedOrders = Object.values(get(twapOrdersAtom)).filter(({ id }) => !indexedEoaHashes.has(id))
  const orders = [...cachedOrders, ...indexedEoaOrders]

  return orders.flat().filter((order) => {
    // Persisted v1 Safe orders predate resolvedOwner.
    const resolvedOwner = order.resolvedOwner ?? order.safeAddress

    return areAddressesEqual(resolvedOwner, account) && order.chainId === chainId
  })
})
