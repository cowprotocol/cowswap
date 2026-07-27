import { atom } from 'jotai'

import { EnrichedOrder } from '@cowprotocol/cow-sdk'

export interface ApiOrdersState {
  orders: EnrichedOrder[]
  isLoading: boolean
}

export const apiOrdersAtom = atom<ApiOrdersState>({ orders: [], isLoading: false })
