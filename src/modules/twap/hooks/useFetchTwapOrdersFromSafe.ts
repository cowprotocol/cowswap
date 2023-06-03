import { useEffect, useState } from 'react'

import ms from 'ms.macro'

import { ComposableCoW } from 'abis/types'
import { useSafeApiKit } from 'api/gnosisSafe/hooks/useSafeApiKit'

import { fetchTwapOrdersFromSafe, TwapOrdersSafeData } from '../services/fetchTwapOrdersFromSafe'

const PENDING_TWAP_UPDATE_INTERVAL = ms`5s`

export function useFetchTwapOrdersFromSafe({
  account,
  composableCowContract,
}: {
  account: string
  composableCowContract: ComposableCoW
}): TwapOrdersSafeData[] {
  const safeApiKit = useSafeApiKit()
  const [ordersSafeData, setOrdersSafeData] = useState<TwapOrdersSafeData[]>([])

  useEffect(() => {
    if (!safeApiKit) return

    const persistOrders = () => {
      fetchTwapOrdersFromSafe(account, safeApiKit, composableCowContract).then(setOrdersSafeData)
    }

    const interval = setInterval(persistOrders, PENDING_TWAP_UPDATE_INTERVAL)

    persistOrders()

    return () => clearInterval(interval)
  }, [account, safeApiKit, composableCowContract])

  return ordersSafeData
}
