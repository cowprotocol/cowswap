import { useUpdateAtom } from 'jotai/utils'
import { useEffect, useMemo } from 'react'

import { SupportedChainId } from '@cowprotocol/cow-sdk'

import { ComposableCoW } from 'abis/types'

import { useDiscreteOrdersFromOrderBook } from '../hooks/useDiscreteOrdersFromOrderBook'
import { useFetchDiscreteOrders } from '../hooks/useFetchDiscreteOrders'
import { useFetchTwapOrdersFromSafe } from '../hooks/useFetchTwapOrdersFromSafe'
import { useTwapOrdersAuthMulticall } from '../hooks/useTwapOrdersAuthMulticall'
import { twapDiscreteOrdersAtom } from '../state/twapDiscreteOrdersAtom'
import { twapOrdersListAtom } from '../state/twapOrdersListAtom'
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

  const discreteOrdersFromOrderBook = useDiscreteOrdersFromOrderBook()
  const setTwapOrders = useUpdateAtom(twapOrdersListAtom)
  const updateTwapDiscreteOrders = useUpdateAtom(twapDiscreteOrdersAtom)
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

  const discreteOrders = useFetchDiscreteOrders(safeAddress, chainId, composableCowContract, openOrCancelledOrders)
  // Here we know which orders are cancelled: if it's auth !== true, then it's cancelled
  const ordersAuthResult = useTwapOrdersAuthMulticall(safeAddress, composableCowContract, openOrCancelledOrders)

  useEffect(() => {
    if (!ordersAuthResult || !discreteOrdersFromOrderBook) return

    const items = getTwapOrdersItems(safeAddress, allOrdersInfo, ordersAuthResult, discreteOrdersFromOrderBook)

    if (!items.length) return

    setTwapOrders(items)
  }, [safeAddress, allOrdersInfo, ordersAuthResult, discreteOrdersFromOrderBook, setTwapOrders])

  useEffect(() => {
    if (!discreteOrders) return

    updateTwapDiscreteOrders(discreteOrders)
  }, [discreteOrders, updateTwapDiscreteOrders])

  return null
}
