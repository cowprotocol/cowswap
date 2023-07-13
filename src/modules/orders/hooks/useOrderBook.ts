import { useAtomValue } from 'jotai'

import { EnrichedOrder } from '@cowprotocol/cow-sdk'

import { orderBookAtom } from '../state/orderBookAtom'

export function useOrderBook(): EnrichedOrder[] {
  return useAtomValue(orderBookAtom)
}
