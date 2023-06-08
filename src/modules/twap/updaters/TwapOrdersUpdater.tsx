import { useAtomValue, useUpdateAtom } from 'jotai/utils'
import { useEffect, useMemo } from 'react'

import { SupportedChainId } from '@cowprotocol/cow-sdk'

import { ComposableCoW } from 'abis/types'

import { TWAP_NOT_PENDING_STATUSES } from '../const'
import { useFetchTwapOrdersFromSafe } from '../hooks/useFetchTwapOrdersFromSafe'
import { useFetchTwapPartOrders } from '../hooks/useFetchTwapPartOrders'
import { useTwapDiscreteOrders } from '../hooks/useTwapDiscreteOrders'
import { useTwapOrdersAuthMulticall } from '../hooks/useTwapOrdersAuthMulticall'
import { twapOrdersListAtom, updateTwapOrdersListAtom } from '../state/twapOrdersListAtom'
import { updateTwapPartOrdersAtom } from '../state/twapPartOrdersAtom'
import { TwapOrderInfo } from '../types'
import { buildTwapOrdersItems } from '../utils/buildTwapOrdersItems'
import { getConditionalOrderId } from '../utils/getConditionalOrderId'
import { isTwapOrderExpired } from '../utils/getTwapOrderStatus'
import { parseTwapOrderStruct } from '../utils/parseTwapOrderStruct'

export function TwapOrdersUpdater(props: {
  safeAddress: string
  chainId: SupportedChainId
  composableCowContract: ComposableCoW
}) {
  const { safeAddress, chainId, composableCowContract } = props

  const twapDiscreteOrders = useTwapDiscreteOrders()
  const twapOrdersList = useAtomValue(twapOrdersListAtom)
  const setTwapOrders = useUpdateAtom(updateTwapOrdersListAtom)
  const updateTwapPartOrders = useUpdateAtom(updateTwapPartOrdersAtom)
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
    return allOrdersInfo.filter((info) => {
      const existedOrder = twapOrdersList[info.id]

      if (existedOrder) {
        return !TWAP_NOT_PENDING_STATUSES.includes(existedOrder.status)
      }

      return !info.isExpired && info.safeData.isExecuted
    })
  }, [allOrdersInfo, twapOrdersList])

  const partOrders = useFetchTwapPartOrders(safeAddress, chainId, composableCowContract, openOrCancelledOrders)
  // Here we know which orders are cancelled: if it's auth !== true, then it's cancelled
  const ordersAuthResult = useTwapOrdersAuthMulticall(safeAddress, composableCowContract, openOrCancelledOrders)

  useEffect(() => {
    if (!ordersAuthResult || !twapDiscreteOrders) return

    const items = buildTwapOrdersItems(chainId, safeAddress, allOrdersInfo, ordersAuthResult, twapDiscreteOrders)

    setTwapOrders(items)
  }, [chainId, safeAddress, allOrdersInfo, ordersAuthResult, twapDiscreteOrders, setTwapOrders])

  useEffect(() => {
    if (!partOrders) return

    updateTwapPartOrders(partOrders)
  }, [partOrders, updateTwapPartOrders])

  return null
}
