import { useAtomValue, useUpdateAtom } from 'jotai/utils'
import { useEffect, useMemo, useRef } from 'react'

import { ComposableCoW } from '@cowprotocol/abis'
import { SupportedChainId } from '@cowprotocol/cow-sdk'

import ms from 'ms.macro'

import { useGnosisSafeInfo } from 'modules/wallet'

import { TWAP_PENDING_STATUSES } from '../const'
import { useFetchTwapOrdersFromSafe } from '../hooks/useFetchTwapOrdersFromSafe'
import { useTwapDiscreteOrders } from '../hooks/useTwapDiscreteOrders'
import { useTwapOrdersAuthMulticall } from '../hooks/useTwapOrdersAuthMulticall'
import { useTwapOrdersExecutions } from '../hooks/useTwapOrdersExecutions'
import { deleteTwapOrdersFromListAtom, twapOrdersAtom, updateTwapOrdersListAtom } from '../state/twapOrdersListAtom'
import { TwapOrderInfo, TwapOrderItem, TwapOrdersSafeData, TwapOrderStatus } from '../types'
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
  const deleteTwapOrders = useUpdateAtom(deleteTwapOrdersFromListAtom)
  const safeInfo = useGnosisSafeInfo()
  const ordersSafeData = useFetchTwapOrdersFromSafe(props)
  const safeNonce = safeInfo?.nonce

  const twapOrdersListRef = useRef(twapOrdersList)
  twapOrdersListRef.current = twapOrdersList

  const allOrdersInfo = useMemo(() => parseOrdersSafeData(ordersSafeData), [ordersSafeData])

  const ordersIds = useMemo(() => allOrdersInfo.map((item) => item.id), [allOrdersInfo])

  const _twapOrderExecutions = useTwapOrdersExecutions(ordersIds)
  const twapOrderExecutions = useRef(_twapOrderExecutions)
  twapOrderExecutions.current = _twapOrderExecutions

  // Here we can split all orders in two groups: 1. Not signed + expired, 2. Open + cancelled
  const pendingTwapOrders = useMemo(() => {
    return allOrdersInfo.filter((info) => shouldCheckOrderAuth(info, twapOrdersListRef.current[info.id]))
  }, [allOrdersInfo])

  // Here we know which orders are cancelled: if it's auth === false, then it's cancelled
  const ordersAuthResult = useTwapOrdersAuthMulticall(safeAddress, composableCowContract, pendingTwapOrders)

  /**
   * Since, a transaction proposal might be rejected in Safe
   * We should remove this TWAP order creation transactions from store
   */
  const ordersToDelete = useMemo(() => {
    if (!safeNonce) return []

    return allOrdersInfo
      .filter((data) => {
        const { nonce, isExecuted } = data.safeData.safeTxParams

        return !isExecuted && nonce < safeNonce
      })
      .map((item) => item.id)
  }, [safeNonce, allOrdersInfo])

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

    ordersToDelete.forEach((id) => {
      delete items[id]
    })

    updateTwapOrders(items)
    deleteTwapOrders(ordersToDelete)
  }, [
    chainId,
    safeAddress,
    allOrdersInfo,
    ordersAuthResult,
    twapDiscreteOrders,
    updateTwapOrders,
    ordersToDelete,
    deleteTwapOrders,
  ])

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

const AUTH_TIME_THRESHOLD = ms`1m`

function shouldCheckOrderAuth(info: TwapOrderInfo, existingOrder: TwapOrderItem | undefined): boolean {
  const { isExecuted, confirmations, executionDate: _executionDate } = info.safeData.safeTxParams
  const executionDate = _executionDate ? new Date(_executionDate) : null

  // Skip expired orders
  if (isTwapOrderExpired(info.orderStruct, executionDate)) return false

  const isTxMined = isExecuted && confirmations > 0

  // Skip not mined orders
  if (!isTxMined) return false

  /**
   * Sometimes, there can be a gap between Safe and Infura node.
   * Safe tells us, that tx is mined, but smart-contract call via Infura says that tx is not mined yet
   * To avoid falsy triggers, we additionally wait 1min after tx mining
   */
  if (!executionDate || Date.now() - executionDate.getTime() < AUTH_TIME_THRESHOLD) {
    return false
  }

  // Skip NOT pending orders
  if (existingOrder) {
    if (existingOrder.status === TwapOrderStatus.Cancelling) return true

    return TWAP_PENDING_STATUSES.includes(existingOrder.status)
  }

  return true
}
