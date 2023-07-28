import { useCallback, useState } from 'react'

import { ComposableCoW } from '@cowprotocol/abis'

import ms from 'ms.macro'

import { useSafeApiKit } from 'api/gnosisSafe/hooks/useSafeApiKit'
import { useInterval } from 'common/hooks/useInterval'

import { fetchTwapOrdersFromSafe } from '../services/fetchTwapOrdersFromSafe'
import { TwapOrdersSafeData } from '../types'

const PENDING_TWAP_UPDATE_INTERVAL = ms`10s`

export function useFetchTwapOrdersFromSafe({
  safeAddress,
  composableCowContract,
}: {
  safeAddress: string
  composableCowContract: ComposableCoW
}): TwapOrdersSafeData[] {
  const safeApiKit = useSafeApiKit()
  const [ordersSafeData, setOrdersSafeData] = useState<TwapOrdersSafeData[]>([])

  const persistOrders = useCallback(() => {
    if (!safeApiKit) return

    // TODO: now it fetches only last N transactions, should take into account the pagination
    fetchTwapOrdersFromSafe(safeAddress, safeApiKit, composableCowContract).then(setOrdersSafeData)
  }, [safeAddress, safeApiKit, composableCowContract])

  useInterval({
    callback: persistOrders,
    name: 'useFetchTwapOrdersFromSafe',
    delay: PENDING_TWAP_UPDATE_INTERVAL,
    triggerEagerly: true,
  })

  return ordersSafeData
}
