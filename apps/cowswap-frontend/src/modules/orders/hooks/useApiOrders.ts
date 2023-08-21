import { useAtomValue } from 'jotai'

import { EnrichedOrder } from '@cowprotocol/cow-sdk'

import { apiOrdersAtom } from '../state/apiOrdersAtom'

export function useApiOrders(): EnrichedOrder[] {
  return useAtomValue(apiOrdersAtom)
}
