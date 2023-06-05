import { useAtomValue } from 'jotai'
import { useMemo } from 'react'

import { Order } from 'legacy/state/orders/actions'
import { useOrdersById } from 'legacy/state/orders/hooks'

import { useWalletInfo } from '../../wallet'
import { twapDiscreteOrdersListAtom } from '../state/twapDiscreteOrdersAtom'

export type TwapToDiscreteOrders = { [twapOrderId: string]: Order }

export function useDiscreteOrdersFromOrderBook(): TwapToDiscreteOrders | null {
  const { chainId } = useWalletInfo()
  const discreteOrders = useAtomValue(twapDiscreteOrdersListAtom)
  const ids = useMemo(() => discreteOrders.map((item) => item.uid), [discreteOrders])
  const orders = useOrdersById({ chainId, ids })

  return useMemo(() => {
    return discreteOrders.reduce<TwapToDiscreteOrders>((acc, item) => {
      const order = orders?.[item.uid]

      if (order) {
        acc[item.twapOrderId] = order
      }

      return acc
    }, {})
  }, [discreteOrders, orders])
}
