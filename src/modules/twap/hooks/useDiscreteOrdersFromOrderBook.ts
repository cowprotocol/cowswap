import { useAtomValue } from 'jotai'
import { useMemo } from 'react'

import { EnrichedOrder, SupportedChainId } from '@cowprotocol/cow-sdk'

import { orderBookApi } from 'cowSdk'
import useSWR, { SWRResponse } from 'swr'

import { AMOUNT_OF_ORDERS_TO_FETCH, GP_ORDER_UPDATE_INTERVAL } from 'legacy/constants'

import { twapDiscreteOrdersListAtom } from '../state/twapDiscreteOrdersAtom'

export type TwapToDiscreteOrders = { [twapOrderId: string]: EnrichedOrder }

export function useDiscreteOrdersFromOrderBook(
  safeAddress: string,
  chainId: SupportedChainId
): TwapToDiscreteOrders | null {
  const discreteOrders = useAtomValue(twapDiscreteOrdersListAtom)
  const prodOrdersResponse = useProdOrders(safeAddress, chainId)

  const prodOrders = useMemo(() => {
    if (!prodOrdersResponse.data) return null

    return prodOrdersResponse.data.reduce<{ [key: string]: EnrichedOrder }>((acc, val) => {
      acc[val.uid] = val
      return acc
    }, {})
  }, [prodOrdersResponse.data])

  return useMemo(() => {
    if (!prodOrders) return null

    return discreteOrders.reduce<TwapToDiscreteOrders>((acc, item) => {
      const order = prodOrders[item.uid]

      if (order) {
        acc[item.twapOrderId] = prodOrders[item.uid]
      }

      return acc
    }, {})
  }, [prodOrders, discreteOrders])
}

// TODO: currently WatchTower creates discrete orders only on PROD
function useProdOrders(owner: string, chainId: SupportedChainId): SWRResponse<EnrichedOrder[]> {
  return useSWR<EnrichedOrder[]>(
    ['getProdOrders', owner, chainId],
    () => {
      return orderBookApi.getOrders({ owner, offset: 0, limit: AMOUNT_OF_ORDERS_TO_FETCH }, { env: 'prod', chainId })
    },
    { refreshInterval: GP_ORDER_UPDATE_INTERVAL }
  )
}
