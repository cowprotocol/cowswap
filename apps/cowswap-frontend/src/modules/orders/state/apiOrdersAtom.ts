import { atom } from 'jotai'

import { EnrichedOrder } from '@cowprotocol/cow-sdk'

export interface ApiOrdersState {
  orders: EnrichedOrder[]
  isLoadingMore: boolean
}

export const apiOrdersAtom = atom<ApiOrdersState>({ orders: [], isLoadingMore: false })
