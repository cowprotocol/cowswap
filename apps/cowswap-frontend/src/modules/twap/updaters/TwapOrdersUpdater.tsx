import { useAtomValue, useSetAtom } from 'jotai'
import { useEffect, useMemo, useRef } from 'react'

import { useDebounce } from '@cowprotocol/common-hooks'
import { SupportedChainId } from '@cowprotocol/cow-sdk'
import { useGnosisSafeInfo } from '@cowprotocol/wallet'

import { twapOrdersAtom } from 'entities/twap'
import ms from 'ms.macro'

import type { ComposableCowContractData } from 'modules/advancedOrders'

import {
  buildPendingTwapOrderIds,
  getOrphanedOptimisticSigningIds,
  getStaleNonceOrderIds,
} from './twapOrdersUpdater.helpers'
import { useTwapOrdersUpdateInterval } from './useTwapOrdersUpdateInterval'

import { useAllTwapOrdersInfo } from '../hooks/useAllTwapOrdersInfo'
import { useFetchTwapOrdersFromSafe } from '../hooks/useFetchTwapOrdersFromSafe'
import { useTwapOrdersAuthMulticall } from '../hooks/useTwapOrdersAuthMulticall'
import { useTwapOrdersExecutions } from '../hooks/useTwapOrdersExecutions'
import { deleteTwapOrdersFromListAtom, updateTwapOrdersListAtom } from '../state/twapOrdersListAtom'
import { buildTwapOrdersItems, mergePersistedSigningTwapOrders } from '../utils/buildTwapOrdersItems'

const ORDERS_UPDATE_DEBOUNCE = ms`500ms`
const TWAP_ORDERS_UPDATE_INTERVAL = ms`3s`
const ORPHAN_SIGNING_MAX_AGE_MS = ms`3m`

export function TwapOrdersUpdater(props: {
  safeAddress: string
  chainId: SupportedChainId
  composableCowContract: ComposableCowContractData
}): null {
  const { safeAddress, chainId, composableCowContract } = props

  const twapOrdersList = useAtomValue(twapOrdersAtom)
  const updateTwapOrders = useSetAtom(updateTwapOrdersListAtom)
  const deleteTwapOrders = useSetAtom(deleteTwapOrdersFromListAtom)
  const safeInfo = useGnosisSafeInfo()
  const ordersSafeData = useFetchTwapOrdersFromSafe(props)

  const updateTimestamp = useTwapOrdersUpdateInterval(TWAP_ORDERS_UPDATE_INTERVAL)
  const safeNonce = safeInfo?.nonce
  const lastUpdateTimestamp = useRef(0)

  const allOrdersInfo = useDebounce(useAllTwapOrdersInfo(ordersSafeData), ORDERS_UPDATE_DEBOUNCE)

  const _twapOrderExecutions = useTwapOrdersExecutions(allOrdersInfo)
  const twapOrderExecutions = useRef(_twapOrderExecutions)
  // eslint-disable-next-line react-hooks/refs
  twapOrderExecutions.current = _twapOrderExecutions

  const pendingTwapOrderIds = useMemo(
    () => buildPendingTwapOrderIds(allOrdersInfo, twapOrdersList),
    [allOrdersInfo, twapOrdersList],
  )

  const ordersAuthResult = useTwapOrdersAuthMulticall(safeAddress, composableCowContract, pendingTwapOrderIds)

  useEffect(() => {
    const orphanedSigningIds = getOrphanedOptimisticSigningIds(
      allOrdersInfo,
      twapOrdersList,
      Date.now(),
      ORPHAN_SIGNING_MAX_AGE_MS,
    )

    if (orphanedSigningIds.length > 0) {
      deleteTwapOrders(orphanedSigningIds)
    }
  }, [allOrdersInfo, deleteTwapOrders, twapOrdersList])

  useEffect(() => {
    const ordersAuthEffective = ordersAuthResult ?? {}

    if (
      updateTimestamp &&
      lastUpdateTimestamp.current &&
      updateTimestamp - lastUpdateTimestamp.current < TWAP_ORDERS_UPDATE_INTERVAL
    ) {
      return
    }

    const built = buildTwapOrdersItems(
      chainId,
      safeAddress,
      allOrdersInfo,
      ordersAuthEffective,
      twapOrderExecutions.current,
    )

    const items = mergePersistedSigningTwapOrders(
      built,
      twapOrdersList,
      ordersAuthEffective,
      twapOrderExecutions.current,
    )

    const ordersToDelete = getStaleNonceOrderIds(allOrdersInfo, safeNonce)

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
    twapOrdersList,
  ])

  return null
}
