import { useAtomValue, useSetAtom } from 'jotai'
import { useEffect, useMemo, useRef } from 'react'

import { ComposableCoW } from '@cowprotocol/abis'
import { SupportedChainId } from '@cowprotocol/cow-sdk'
import { useGnosisSafeInfo } from '@cowprotocol/wallet'

import ms from 'ms.macro'

import { TWAP_PENDING_STATUSES } from '../const'
import { useFetchTwapOrdersFromSafe } from '../hooks/useFetchTwapOrdersFromSafe'
import { useTwapOrdersAuthMulticall } from '../hooks/useTwapOrdersAuthMulticall'
import { useTwapOrdersExecutions } from '../hooks/useTwapOrdersExecutions'
import { deleteTwapOrdersFromListAtom, twapOrdersAtom, updateTwapOrdersListAtom } from '../state/twapOrdersListAtom'
import { TwapOrderInfo, TwapOrderItem, TwapOrdersSafeData } from '../types'
import { buildTwapOrdersItems } from '../utils/buildTwapOrdersItems'
import { getConditionalOrderId } from '../utils/getConditionalOrderId'
import { isTwapOrderExpired } from '../utils/getTwapOrderStatus'
import { parseTwapOrderStruct } from '../utils/parseTwapOrderStruct'

// TODO: Add proper return type annotation
// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
export function TwapOrdersUpdater(props: {
  safeAddress: string
  chainId: SupportedChainId
  composableCowContract: ComposableCoW
}) {
  const { safeAddress, chainId, composableCowContract } = props

  const twapOrdersList = useAtomValue(twapOrdersAtom)
  const updateTwapOrders = useSetAtom(updateTwapOrdersListAtom)
  const deleteTwapOrders = useSetAtom(deleteTwapOrdersFromListAtom)
  const safeInfo = useGnosisSafeInfo()
  const ordersSafeData = useFetchTwapOrdersFromSafe(props)
  const safeNonce = safeInfo?.nonce

  const twapOrdersListRef = useRef(twapOrdersList)
  twapOrdersListRef.current = twapOrdersList

  const allOrdersInfo = useMemo(() => parseOrdersSafeData(ordersSafeData), [ordersSafeData])

  const _twapOrderExecutions = useTwapOrdersExecutions(allOrdersInfo)

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
    if (!ordersAuthResult) return

    const items = buildTwapOrdersItems(
      chainId,
      safeAddress,
      allOrdersInfo,
      ordersAuthResult,
      twapOrderExecutions.current,
    )

    ordersToDelete.forEach((id) => {
      delete items[id]
    })

    updateTwapOrders(items)
    deleteTwapOrders(ordersToDelete)
  }, [chainId, safeAddress, allOrdersInfo, ordersAuthResult, updateTwapOrders, ordersToDelete, deleteTwapOrders])

  return null
}

function parseOrdersSafeData(ordersSafeData: TwapOrdersSafeData[]): TwapOrderInfo[] {
  const ordersInfoMap = ordersSafeData.reduce<{ [id: string]: TwapOrderInfo }>((acc, data) => {
    try {
      const id = getConditionalOrderId(data.conditionalOrderParams)
      const existingOrder = acc[id]

      /**
       * There might be two Safe transactions with the same order inside.
       * But only one of them will be executed.
       *
       * For example, you propose a transaction with TWAP order and execute it.
       * Then, you propose another transaction with the same TWAP order.
       * After you realize that the proposed transaction is a duplicate, and you replace it or cancel.
       * In this case we should skip the second transaction, because the first one is already executed.
       */
      if (existingOrder?.safeData.safeTxParams.isExecuted) {
        return acc
      }

      const info = {
        id,
        orderStruct: parseTwapOrderStruct(data.conditionalOrderParams.staticInput),
        safeData: data,
      }

      acc[id] = info
    } catch {
      // Do nothing
    }

    return acc
  }, {})

  return Object.values(ordersInfoMap)
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
    return TWAP_PENDING_STATUSES.includes(existingOrder.status)
  }

  return true
}
