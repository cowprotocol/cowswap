import { useAtomValue, useSetAtom } from 'jotai'
import { useEffect, useMemo, useRef, useState } from 'react'

import { useDebounce } from '@cowprotocol/common-hooks'
import { SupportedChainId } from '@cowprotocol/cow-sdk'
import { ComposableCoW } from '@cowprotocol/cowswap-abis'
import { useGnosisSafeInfo } from '@cowprotocol/wallet'

import ms from 'ms.macro'

import { TWAP_PENDING_STATUSES } from '../const'
import { useAllTwapOrdersInfo } from '../hooks/useAllTwapOrdersInfo'
import { useFetchTwapOrdersFromSafe } from '../hooks/useFetchTwapOrdersFromSafe'
import { useTwapOrdersAuthMulticall } from '../hooks/useTwapOrdersAuthMulticall'
import { useTwapOrdersExecutions } from '../hooks/useTwapOrdersExecutions'
import { deleteTwapOrdersFromListAtom, twapOrdersAtom, updateTwapOrdersListAtom } from '../state/twapOrdersListAtom'
import { TwapOrderInfo, TwapOrderItem } from '../types'
import { buildTwapOrdersItems } from '../utils/buildTwapOrdersItems'
import { isTwapOrderExpired } from '../utils/getTwapOrderStatus'

const ORDERS_UPDATE_DEBOUNCE = ms`500ms`
const TWAP_ORDERS_UPDATE_INTERVAL = ms`3s`
const AUTH_TIME_THRESHOLD = ms`1m`

export function TwapOrdersUpdater(props: {
  safeAddress: string
  chainId: SupportedChainId
  composableCowContract: ComposableCoW
}): null {
  const { safeAddress, chainId, composableCowContract } = props

  const twapOrdersList = useAtomValue(twapOrdersAtom)
  const updateTwapOrders = useSetAtom(updateTwapOrdersListAtom)
  const deleteTwapOrders = useSetAtom(deleteTwapOrdersFromListAtom)
  const safeInfo = useGnosisSafeInfo()
  const ordersSafeData = useFetchTwapOrdersFromSafe(props)

  const [updateTimestamp, setUpdateTimestamp] = useState(0)
  const safeNonce = safeInfo?.nonce
  const lastUpdateTimestamp = useRef(0)

  const twapOrdersListRef = useRef(twapOrdersList)
  // eslint-disable-next-line react-hooks/refs
  twapOrdersListRef.current = twapOrdersList

  const allOrdersInfo = useDebounce(useAllTwapOrdersInfo(ordersSafeData), ORDERS_UPDATE_DEBOUNCE)

  const _twapOrderExecutions = useTwapOrdersExecutions(allOrdersInfo)
  const twapOrderExecutions = useRef(_twapOrderExecutions)
  // eslint-disable-next-line react-hooks/refs
  twapOrderExecutions.current = _twapOrderExecutions

  // Here we can split all orders in two groups: 1. Not signed + expired, 2. Open + cancelled
  const pendingTwapOrderIds = useMemo(() => {
    // eslint-disable-next-line react-hooks/refs
    return allOrdersInfo.reduce<string[]>((acc, info) => {
      if (shouldCheckOrderAuth(info, twapOrdersListRef.current[info.id])) {
        acc.push(info.id)
      }

      return acc
    }, [])
  }, [allOrdersInfo])

  // Here we know which orders are cancelled: if it's auth === false, then it's cancelled
  const ordersAuthResult = useTwapOrdersAuthMulticall(safeAddress, composableCowContract, pendingTwapOrderIds)

  useEffect(() => {
    const interval = setInterval(() => {
      setUpdateTimestamp(Date.now())
    }, TWAP_ORDERS_UPDATE_INTERVAL)

    return () => {
      clearInterval(interval)
    }
  }, [])

  useEffect(() => {
    if (!ordersAuthResult) return

    // Do not update more often than once in 3 seconds
    // At the same time, do updates every 3 seconds
    if (
      updateTimestamp &&
      lastUpdateTimestamp.current &&
      updateTimestamp - lastUpdateTimestamp.current < TWAP_ORDERS_UPDATE_INTERVAL
    ) {
      return
    }

    const items = buildTwapOrdersItems(
      chainId,
      safeAddress,
      allOrdersInfo,
      ordersAuthResult,
      twapOrderExecutions.current,
    )

    /**
     * Since, a transaction proposal might be rejected in Safe
     * We should remove this TWAP order creation transactions from store
     */
    const ordersToDelete = (() => {
      if (!safeNonce) return []

      return allOrdersInfo
        .filter((data) => {
          const { nonce, isExecuted } = data.safeData.safeTxParams

          return !isExecuted && nonce < safeNonce
        })
        .map((item) => item.id)
    })()

    ordersToDelete.forEach((id) => {
      delete items[id]
    })

    lastUpdateTimestamp.current = Date.now()
    updateTwapOrders(items)
    deleteTwapOrders(ordersToDelete)
  }, [
    chainId,
    safeAddress,
    safeNonce,
    allOrdersInfo,
    ordersAuthResult,
    updateTimestamp,
    updateTwapOrders,
    deleteTwapOrders,
  ])

  return null
}

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
