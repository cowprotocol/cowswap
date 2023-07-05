import { useAtomValue, useUpdateAtom } from 'jotai/utils'
import { useEffect, useMemo, useRef } from 'react'

import { ComposableCoW } from '@cowprotocol/abis'
import { SupportedChainId } from '@cowprotocol/cow-sdk'

import { TWAP_PENDING_STATUSES } from '../const'
import { useFetchTwapOrdersFromSafe } from '../hooks/useFetchTwapOrdersFromSafe'
import { useTwapDiscreteOrders } from '../hooks/useTwapDiscreteOrders'
import { useTwapOrdersAuthMulticall } from '../hooks/useTwapOrdersAuthMulticall'
import { useTwapOrdersExecutions } from '../hooks/useTwapOrdersExecutions'
import { twapOrdersAtom, updateTwapOrdersListAtom } from '../state/twapOrdersListAtom'
import { TwapOrderInfo, TwapOrderItem, TwapOrdersSafeData } from '../types'
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
  const twapOrdersList = useAtomValue(twapOrdersAtom)
  const updateTwapOrders = useUpdateAtom(updateTwapOrdersListAtom)
  const ordersSafeData = useFetchTwapOrdersFromSafe(props)

  const allOrdersInfo = useMemo(() => parseOrdersSafeData(ordersSafeData), [ordersSafeData])

  const ordersIds = useMemo(() => allOrdersInfo.map((item) => item.id), [allOrdersInfo])

  const _twapOrderExecutions = useTwapOrdersExecutions(ordersIds)
  const twapOrderExecutions = useRef(_twapOrderExecutions)
  twapOrderExecutions.current = _twapOrderExecutions

  // Here we can split all orders in two groups: 1. Not signed + expired, 2. Open + cancelled
  const pendingOrCancelledOrders = useMemo(() => {
    return allOrdersInfo.filter((info) => shouldCheckOrderAuth(info, twapOrdersList[info.id]))
  }, [allOrdersInfo, twapOrdersList])

  // Here we know which orders are cancelled: if it's auth === false, then it's cancelled
  const ordersAuthResult = useTwapOrdersAuthMulticall(safeAddress, composableCowContract, pendingOrCancelledOrders)

  useEffect(() => {
    if (!ordersAuthResult || !twapDiscreteOrders) return

    const items = buildTwapOrdersItems(
      chainId,
      safeAddress,
      allOrdersInfo,
      ordersAuthResult,
      twapDiscreteOrders,
      twapOrderExecutions.current
    )
    updateTwapOrders(items)
  }, [chainId, safeAddress, allOrdersInfo, ordersAuthResult, twapDiscreteOrders, updateTwapOrders])

  return null
}

function parseOrdersSafeData(ordersSafeData: TwapOrdersSafeData[]): TwapOrderInfo[] {
  return ordersSafeData.reduce<TwapOrderInfo[]>((acc, data) => {
    try {
      const info = {
        id: getConditionalOrderId(data.conditionalOrderParams),
        orderStruct: parseTwapOrderStruct(data.conditionalOrderParams.staticInput),
        safeData: data,
      }

      acc.push(info)
    } catch (e) {}

    return acc
  }, [])
}

function shouldCheckOrderAuth(info: TwapOrderInfo, existingOrder: TwapOrderItem | undefined): boolean {
  const { isExecuted, confirmations, executionDate: _executionDate } = info.safeData.safeTxParams
  const executionDate = _executionDate ? new Date(_executionDate) : null

  // Skip expired orders
  if (isTwapOrderExpired(info.orderStruct, executionDate)) return false

  const isTxMined = isExecuted && confirmations > 0

  // Skip not mined orders
  if (!isTxMined) return false

  // Skip NOT pending orders
  if (existingOrder) {
    return TWAP_PENDING_STATUSES.includes(existingOrder.status)
  }

  return true
}
