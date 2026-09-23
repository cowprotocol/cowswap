import { useAtomValue } from 'jotai'
import { useCallback } from 'react'

import { EnrichedOrder } from '@cowprotocol/cow-sdk'

import { eoaTwapOrdersAtom, emulateTwapAsOrder, isEoaTwapOrderItem, twapOrdersAtom } from 'entities/twap'

export type TwapOrderByIdResult = {
  order: Omit<EnrichedOrder, 'settlementContract'>
  isEoaTwap: boolean
}

export function useGetTwapOrderById(): (orderId: string) => TwapOrderByIdResult | null {
  const twapOrdersList = useAtomValue(twapOrdersAtom)
  const eoaTwapOrdersList = useAtomValue(eoaTwapOrdersAtom)

  return useCallback(
    (orderId: string) => {
      // Indexed EOA TWAPs live in eoaTwapOrdersAtom; Safe + optimistic EOA rows in twapOrdersAtom.
      const item = eoaTwapOrdersList[orderId] ?? twapOrdersList[orderId]
      if (!item) return null

      return {
        order: emulateTwapAsOrder(item),
        isEoaTwap: isEoaTwapOrderItem(item),
      }
    },
    [eoaTwapOrdersList, twapOrdersList],
  )
}
