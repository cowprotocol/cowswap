import { useAtomValue } from 'jotai'

import { EnrichedOrder } from '@cowprotocol/cow-sdk'

import { ApiOrdersState, apiOrdersAtom } from '../state/apiOrdersAtom'

export function useApiOrders(): EnrichedOrder[] {
  return useAtomValue(apiOrdersAtom).orders
}

export function useApiOrdersState(): ApiOrdersState {
  return useAtomValue(apiOrdersAtom)
}
