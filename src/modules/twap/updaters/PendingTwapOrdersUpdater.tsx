import { useUpdateAtom } from 'jotai/utils'
import { useEffect, useMemo } from 'react'

import { ComposableCoW } from 'abis/types'

import { useFetchDiscreteOrders } from '../hooks/useFetchDiscreteOrders'
import { useFetchTwapOrdersFromSafe } from '../hooks/useFetchTwapOrdersFromSafe'
import { updateTwapDiscreteOrdersListAtom } from '../state/twapDiscreteOrdersListAtom'
import { twapOrdersListAtom } from '../state/twapOrdersListAtom'
import { TwapOrderInfo } from '../types'
import { getConditionalOrderId } from '../utils/getConditionalOrderId'
import { getTwapOrdersItems } from '../utils/getTwapOrdersItems'
import { isTwapOrderExpired } from '../utils/getTwapOrderStatus'
import { parseTwapOrderStruct } from '../utils/parseTwapOrderStruct'

export function PendingTwapOrdersUpdater(props: { safeAddress: string; composableCowContract: ComposableCoW }) {
  const { safeAddress, composableCowContract } = props

  const setTwapOrders = useUpdateAtom(twapOrdersListAtom)
  const updateTwapDiscreteOrders = useUpdateAtom(updateTwapDiscreteOrdersListAtom)

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

  // Here we know which orders are cancelled: if it has discrete order -it's not cancelled
  const discreteOrders = useFetchDiscreteOrders(safeAddress, composableCowContract, openOrCancelledOrders)

  useEffect(() => {
    if (!discreteOrders) return

    setTwapOrders(getTwapOrdersItems(safeAddress, allOrdersInfo, discreteOrders))
  }, [safeAddress, allOrdersInfo, discreteOrders, setTwapOrders])

  useEffect(() => {
    if (!discreteOrders) return

    updateTwapDiscreteOrders(discreteOrders)
  }, [discreteOrders, updateTwapDiscreteOrders])

  return null
}
