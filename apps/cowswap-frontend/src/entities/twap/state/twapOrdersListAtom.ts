import { atom } from 'jotai'

import { isTruthy } from '@cowprotocol/common-utils'
import { areAddressesEqual } from '@cowprotocol/cow-sdk'
import { walletInfoAtom } from '@cowprotocol/wallet'

import type { TwapOrderItem } from 'modules/twap'

import { eoaTwapOrdersAtom } from './eoaTwapOrdersAtom'
import { twapOrdersAtom } from './twapOrdersAtom'

export const twapOrdersListAtom = atom<TwapOrderItem[]>((get) => {
  const { account, chainId } = get(walletInfoAtom)

  if (!account || !chainId) return []

  // 1. Indexed EOA orders use eventId as id and retain the matching optimistic order's hash.
  const indexedEoaOrders = Object.values(get(eoaTwapOrdersAtom))
  const indexedEoaHashes = new Set(indexedEoaOrders.map(({ hash }) => hash).filter(isTruthy))

  // 2. Replace optimistic EOA orders with their indexed events while retaining cached Safe orders.
  let cachedOrders = Object.values(get(twapOrdersAtom))
  cachedOrders = cachedOrders.filter(({ id }) => !indexedEoaHashes.has(id))

  // 3. Combine cached Safe/unmatched optimistic orders with indexed EOA orders, then select owner and chain.
  return [...cachedOrders, ...indexedEoaOrders].filter((order) => {
    // Persisted v1 Safe orders predate resolvedOwner.
    const resolvedOwner = order.resolvedOwner ?? order.safeAddress

    return areAddressesEqual(resolvedOwner, account) && order.chainId === chainId
  })
})
