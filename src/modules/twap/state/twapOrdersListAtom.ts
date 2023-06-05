import { atom } from 'jotai'
import { atomWithStorage } from 'jotai/utils'

import { tokensByAddressAtom } from 'modules/tokensList/state/tokensListAtom'
import { walletInfoAtom } from 'modules/wallet/api/state'

import { TwapOrderItem } from '../types'
import { parsePendingTwapOrder } from '../utils/parsePendingTwapOrder'

export const twapOrdersListAtom = atomWithStorage<TwapOrderItem[]>('twap-orders-list:v1', [])

export const parsedTwapOrdersAtom = atom((get) => {
  const { account } = get(walletInfoAtom)
  const tokens = get(tokensByAddressAtom)
  const orders = get(twapOrdersListAtom)
  const accountLowerCase = account?.toLowerCase()

  if (!accountLowerCase) return []

  return orders
    .filter((order) => order.safeAddress.toLowerCase() === accountLowerCase)
    .map((order) => parsePendingTwapOrder(tokens, order))
})
