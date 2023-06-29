import { useAtomValue } from 'jotai'
import { useMemo } from 'react'

import { Order } from 'legacy/state/orders/actions'
import { useOrdersById } from 'legacy/state/orders/hooks'

import { useWalletInfo } from '../../wallet'
import { twapPartOrdersListAtom } from '../state/twapPartOrdersAtom'

export type TwapToDiscreteOrders = { [twapOrderId: string]: Order }

export function useTwapDiscreteOrders(): TwapToDiscreteOrders | null {
  const { chainId } = useWalletInfo()
  const partOrders = useAtomValue(twapPartOrdersListAtom)
  const ids = useMemo(() => partOrders.map((item) => item.uid), [partOrders])
  const orders = useOrdersById({ chainId, ids })

  return useMemo(() => {
    return partOrders.reduce<TwapToDiscreteOrders>((acc, item) => {
      const order = orders?.[item.uid]

      if (order) {
        acc[item.twapOrderId] = order
      }

      return acc
    }, {})
  }, [partOrders, orders])
}
