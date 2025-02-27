import { useEffect, useState } from 'react'

import { ComposableCoW } from '@cowprotocol/abis'
import { useWalletInfo } from '@cowprotocol/wallet'

import ms from 'ms.macro'

import { fetchTwapOrdersFromSafe } from '../services/fetchTwapOrdersFromSafe'
import { TwapOrdersSafeData } from '../types'

const PENDING_TWAP_UPDATE_INTERVAL = ms`15s`

export function useFetchTwapOrdersFromSafe({
  safeAddress,
  composableCowContract,
}: {
  safeAddress: string
  composableCowContract: ComposableCoW
}): TwapOrdersSafeData[] {
  const { chainId } = useWalletInfo()
  const [ordersSafeData, setOrdersSafeData] = useState<TwapOrdersSafeData[]>([])

  useEffect(() => {
    const persistOrders = () => {
      fetchTwapOrdersFromSafe(safeAddress, chainId, composableCowContract).then(setOrdersSafeData)
    }

    const interval = setInterval(persistOrders, PENDING_TWAP_UPDATE_INTERVAL)

    persistOrders()

    return () => clearInterval(interval)
  }, [safeAddress, chainId, composableCowContract])

  return ordersSafeData
}
