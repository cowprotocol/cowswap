import { useAtomValue, useUpdateAtom } from 'jotai/utils'
import { useEffect, useMemo } from 'react'

import { SupportedChainId } from '@cowprotocol/cow-sdk'

import { isTruthy } from 'legacy/utils/misc'

import { ComposableCoW } from 'abis/types'

import { TWAP_PENDING_STATUSES } from '../const'
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
  const updateTwapOrders = useUpdateAtom(updateTwapOrdersListAtom)
  const updateTwapPartOrders = useUpdateAtom(updateTwapPartOrdersAtom)
  const ordersSafeData = useFetchTwapOrdersFromSafe(props)

  const allOrdersInfo: TwapOrderInfo[] = useMemo(() => {
    return ordersSafeData
      .map((data) => {
        try {
          const id = getConditionalOrderId(data.conditionalOrderParams)
          const order = parseTwapOrderStruct(data.conditionalOrderParams.staticInput)

          return {
            id,
            orderStruct: order,
            safeData: data,
            isExpired: isTwapOrderExpired(order),
          }
        } catch (e) {
          return null
        }
      })
      .filter(isTruthy)
  }, [ordersSafeData])

  // Here we can split all orders in two groups: 1. Not signed + expired, 2. Open + cancelled
  const pendingOrCancelledOrders = useMemo(() => {
    return allOrdersInfo.filter((info) => {
      const existingOrder = twapOrdersList[info.id]

      if (existingOrder) {
        return TWAP_PENDING_STATUSES.includes(existingOrder.status)
      }

      return !info.isExpired && info.safeData.safeTxParams.isExecuted
    })
  }, [allOrdersInfo, twapOrdersList])

  const partOrders = useFetchTwapPartOrders(safeAddress, chainId, composableCowContract, pendingOrCancelledOrders)
  // Here we know which orders are cancelled: if it's auth === false, then it's cancelled
  const ordersAuthResult = useTwapOrdersAuthMulticall(safeAddress, composableCowContract, pendingOrCancelledOrders)

  useEffect(() => {
    if (!ordersAuthResult || !twapDiscreteOrders) return

    const items = buildTwapOrdersItems(chainId, safeAddress, allOrdersInfo, ordersAuthResult, twapDiscreteOrders)

    updateTwapOrders(items)
  }, [chainId, safeAddress, allOrdersInfo, ordersAuthResult, twapDiscreteOrders, updateTwapOrders])

  useEffect(() => {
    if (!partOrders) return

    updateTwapPartOrders(partOrders)
  }, [partOrders, updateTwapPartOrders])

  return null
}
