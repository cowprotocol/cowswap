import { useAtomValue } from 'jotai'
import { useCallback } from 'react'

import { EnrichedOrder } from '@cowprotocol/cow-sdk'

import { twapOrdersAtom } from '../state/twapOrdersListAtom'
import { emulateTwapAsOrder } from '../utils/emulateTwapAsOrder'

export function useGetTwapOrderById(): (orderId: string) => EnrichedOrder | null {
  const twapOrdersList = useAtomValue(twapOrdersAtom)

  return useCallback(
    (orderId: string) => {
      const item = twapOrdersList[orderId]
      return item ? emulateTwapAsOrder(item) : null
    },
    [twapOrdersList]
  )
}
