import { atom } from 'jotai'
import { atomWithStorage } from 'jotai/utils'

import { tokensByAddressAtom } from 'modules/tokensList/state/tokensListAtom'

import { TWAPOrderItem } from '../types'
import { parsePendingTwapOrder } from '../utils/parsePendingTwapOrder'

export const twapOrdersListAtom = atomWithStorage<TWAPOrderItem[]>('twap-orders-list:v1', [])

export const parsedTwapOrdersAtom = atom((get) => {
  const tokens = get(tokensByAddressAtom)
  const orders = get(twapOrdersListAtom)

  return orders.map((order) => parsePendingTwapOrder(tokens, order))
})
