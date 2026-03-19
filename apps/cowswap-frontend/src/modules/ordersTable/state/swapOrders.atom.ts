import { atom } from 'jotai'

import { UiOrderType } from '@cowprotocol/types'

import { reduxOrdersByOrderTypeAtom } from './redux/reduxOrders.atom'

export const swapOrdersAtom = atom((get) => {
  return get(reduxOrdersByOrderTypeAtom)(UiOrderType.SWAP)
})
