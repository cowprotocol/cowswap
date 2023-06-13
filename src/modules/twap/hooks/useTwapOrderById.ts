import { useAtomValue } from 'jotai/utils'

import { twapOrdersListAtom } from '../state/twapOrdersListAtom'
import { TwapOrderItem } from '../types'

export function useTwapOrderById(orderId: string | undefined): TwapOrderItem | null {
  const twapOrdersList = useAtomValue(twapOrdersListAtom)

  return (orderId && twapOrdersList[orderId]) || null
}
