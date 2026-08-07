import { useAtomValue } from 'jotai'
import { useMemo } from 'react'

import type { TwapOrderItem } from 'modules/twap'

import { eoaTwapOrdersAtom } from '../state/eoaTwapOrdersAtom'
import { twapOrdersAtom } from '../state/twapOrdersAtom'

export function useTwapOrderById(orderId: string | undefined): TwapOrderItem | null {
  const twapOrdersList = useAtomValue(twapOrdersAtom)
  const eoaTwapOrders = useAtomValue(eoaTwapOrdersAtom)

  return useMemo(() => {
    return (orderId && (eoaTwapOrders[orderId] || twapOrdersList[orderId])) || null
  }, [eoaTwapOrders, orderId, twapOrdersList])
}
