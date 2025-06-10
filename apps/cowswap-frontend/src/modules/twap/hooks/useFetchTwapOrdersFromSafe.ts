import { useEffect, useState } from 'react'

import { ComposableCoW } from '@cowprotocol/abis'

import ms from 'ms.macro'

import { useSafeApiKit } from 'common/hooks/useSafeApiKit'

import { fetchTwapOrdersFromSafe } from '../services/fetchTwapOrdersFromSafe'
import { TwapOrdersSafeData } from '../types'

const PENDING_TWAP_UPDATE_INTERVAL = ms`45s`

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

    // TODO: Add proper return type annotation
    // eslint-disable-next-line @typescript-eslint/explicit-function-return-type
    const persistOrders = () => {
      fetchTwapOrdersFromSafe(safeAddress, safeApiKit, composableCowContract).then(setOrdersSafeData)
    }

    const interval = setInterval(persistOrders, PENDING_TWAP_UPDATE_INTERVAL)

    persistOrders()

    return () => clearInterval(interval)
  }, [safeAddress, safeApiKit, composableCowContract])

  return ordersSafeData
}
