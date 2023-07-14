import { useAtomValue } from 'jotai'
import { useMemo } from 'react'

import { Order } from 'legacy/state/orders/actions'

import { emulatedPartOrdersAtom } from '../state/emulatedPartOrdersAtom'
import { emulatedTwapOrdersAtom } from '../state/emulatedTwapOrdersAtom'

export function useEmulatedOrders(): Order[] {
  const emulatedTwapOrders = useAtomValue(emulatedTwapOrdersAtom)
  const emulatedPartOrders = useAtomValue(emulatedPartOrdersAtom)

  const allEmulatedOrders = useMemo(() => {
    return emulatedTwapOrders.concat(emulatedPartOrders)
  }, [emulatedTwapOrders, emulatedPartOrders])

  return allEmulatedOrders
}
