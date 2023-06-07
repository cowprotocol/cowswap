import { useAtomValue } from 'jotai'
import { useMemo } from 'react'

import { Order } from 'legacy/state/orders/actions'
import { useOrdersById } from 'legacy/state/orders/hooks'

import { useWalletInfo } from '../../wallet'
import { twapParticleOrdersListAtom } from '../state/twapParticleOrdersAtom'

export type TwapToDiscreteOrders = { [twapOrderId: string]: Order }

export function useTwapDiscreteOrders(): TwapToDiscreteOrders | null {
  const { chainId } = useWalletInfo()
  const particleOrders = useAtomValue(twapParticleOrdersListAtom)
  const ids = useMemo(() => particleOrders.map((item) => item.uid), [particleOrders])
  const orders = useOrdersById({ chainId, ids })

  return useMemo(() => {
    return particleOrders.reduce<TwapToDiscreteOrders>((acc, item) => {
      const order = orders?.[item.uid]

      if (order) {
        acc[item.twapOrderId] = order
      }

      return acc
    }, {})
  }, [particleOrders, orders])
}
