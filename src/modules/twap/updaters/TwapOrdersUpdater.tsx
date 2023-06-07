import { useUpdateAtom } from 'jotai/utils'
import { useEffect, useMemo } from 'react'

import { SupportedChainId } from '@cowprotocol/cow-sdk'

import { ComposableCoW } from 'abis/types'

import { useFetchTwapOrdersFromSafe } from '../hooks/useFetchTwapOrdersFromSafe'
import { useFetchTwapParticleOrders } from '../hooks/useFetchTwapParticleOrders'
import { useTwapDiscreteOrders } from '../hooks/useTwapDiscreteOrders'
import { useTwapOrdersAuthMulticall } from '../hooks/useTwapOrdersAuthMulticall'
import { updateTwapOrdersListAtom } from '../state/twapOrdersListAtom'
import { updateTwapParticleOrdersAtom } from '../state/twapParticleOrdersAtom'
import { TwapOrderInfo } from '../types'
import { getConditionalOrderId } from '../utils/getConditionalOrderId'
import { getTwapOrdersItems } from '../utils/getTwapOrdersItems'
import { isTwapOrderExpired } from '../utils/getTwapOrderStatus'
import { parseTwapOrderStruct } from '../utils/parseTwapOrderStruct'

export function TwapOrdersUpdater(props: {
  safeAddress: string
  chainId: SupportedChainId
  composableCowContract: ComposableCoW
}) {
  const { safeAddress, chainId, composableCowContract } = props

  const twapDiscreteOrders = useTwapDiscreteOrders()
  const setTwapOrders = useUpdateAtom(updateTwapOrdersListAtom)
  const updateTwapParticleOrders = useUpdateAtom(updateTwapParticleOrdersAtom)
  const ordersSafeData = useFetchTwapOrdersFromSafe(props)

  const allOrdersInfo: TwapOrderInfo[] = useMemo(() => {
    return ordersSafeData.map((data) => {
      const id = getConditionalOrderId(data.params)
      const order = parseTwapOrderStruct(data.params.staticInput)

      return {
        id,
        orderStruct: order,
        safeData: data,
        isExpired: isTwapOrderExpired(order),
      }
    })
  }, [ordersSafeData])

  // Here we can split all orders in two groups: 1. Not signed + expired, 2. Open + cancelled
  const openOrCancelledOrders = useMemo(() => {
    return allOrdersInfo.filter((info) => !info.isExpired && info.safeData.isExecuted)
  }, [allOrdersInfo])

  const particleOrders = useFetchTwapParticleOrders(safeAddress, chainId, composableCowContract, openOrCancelledOrders)
  // Here we know which orders are cancelled: if it's auth !== true, then it's cancelled
  const ordersAuthResult = useTwapOrdersAuthMulticall(safeAddress, composableCowContract, openOrCancelledOrders)

  useEffect(() => {
    if (!ordersAuthResult || !twapDiscreteOrders) return

    const items = getTwapOrdersItems(chainId, safeAddress, allOrdersInfo, ordersAuthResult, twapDiscreteOrders)

    setTwapOrders(items)
  }, [chainId, safeAddress, allOrdersInfo, ordersAuthResult, twapDiscreteOrders, setTwapOrders])

  useEffect(() => {
    if (!particleOrders) return

    updateTwapParticleOrders(particleOrders)
  }, [particleOrders, updateTwapParticleOrders])

  return null
}
