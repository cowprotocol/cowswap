import { logTwap, normalizeError } from '@cowprotocol/common-utils'
import { walletInfoAtom } from '@cowprotocol/wallet'

import { eoaTwapOrdersAtom, twapOrdersAtom } from 'entities/twap'
import { atomEffect } from 'jotai-effect'

import { eoaTwapOrdersQueryAtom } from './eoaTwapOrdersQueryAtom'

import { TwapOrderStatus } from '../types'
import { updateTwapOrdersList } from '../utils/updateTwapOrdersList'

export const eoaTwapOrdersEffectAtom = atomEffect((get, set) => {
  const { chainId } = get(walletInfoAtom)
  const { data, error: err } = get(eoaTwapOrdersQueryAtom)

  if (data) {
    const optimisticOrders = get(twapOrdersAtom)
    const orders = Object.fromEntries(
      Object.entries(data.orders).map(([id, order]) => {
        const optimisticOrder = order.hash ? optimisticOrders[order.hash] : undefined

        if (
          order.status === TwapOrderStatus.Pending &&
          (optimisticOrder?.status === TwapOrderStatus.Cancelling ||
            optimisticOrder?.status === TwapOrderStatus.Cancelled)
        ) {
          return [id, { ...order, status: optimisticOrder.status }]
        }

        return [id, order]
      }),
    )

    set(eoaTwapOrdersAtom, (currentOrders) => updateTwapOrdersList(currentOrders, orders))
  }

  if (err) {
    const error = normalizeError(err)
    logTwap.error(error, { chainId: String(chainId) })
  }
})
