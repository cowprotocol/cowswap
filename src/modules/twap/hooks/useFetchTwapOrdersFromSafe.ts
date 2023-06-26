import { useEffect, useState } from 'react'

import ms from 'ms.macro'

import { ComposableCoW } from 'abis/types'
import { useSafeApiKit } from 'api/gnosisSafe/hooks/useSafeApiKit'

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

  useEffect(() => {
    if (!safeApiKit) return

    // TODO: now it fetches only last N transactions, should take into account the pagination
    const persistOrders = () => {
      fetchTwapOrdersFromSafe(safeAddress, safeApiKit, composableCowContract).then(setOrdersSafeData)
    }

    const interval = setInterval(persistOrders, PENDING_TWAP_UPDATE_INTERVAL)

    persistOrders()

    return () => clearInterval(interval)
  }, [safeAddress, safeApiKit, composableCowContract])

  return ordersSafeData
}
