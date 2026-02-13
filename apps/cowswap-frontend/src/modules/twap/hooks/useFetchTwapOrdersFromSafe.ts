import { useEffect, useRef, useState } from 'react'

import { SupportedChainId } from '@cowprotocol/cow-sdk'

import ms from 'ms.macro'

import { ComposableCowContractData } from 'modules/advancedOrders/hooks/useComposableCowContract'

import { fetchTwapOrdersFromSafe } from '../services/fetchTwapOrdersFromSafe'
import { TwapOrdersSafeData } from '../types'

const PENDING_TWAP_UPDATE_INTERVAL = ms`45s`

export function useFetchTwapOrdersFromSafe({
  chainId,
  safeAddress,
  composableCowContract,
}: {
  chainId: SupportedChainId
  safeAddress: string
  composableCowContract: ComposableCowContractData
}): TwapOrdersSafeData[] {
  const [ordersSafeData, setOrdersSafeData] = useState<TwapOrdersSafeData[]>([])
  const updateInProgressRef = useRef(false)

  useEffect(() => {
    const persistOrders = (): void => {
      if (updateInProgressRef.current) return

      updateInProgressRef.current = true

      fetchTwapOrdersFromSafe(chainId, safeAddress, composableCowContract, setOrdersSafeData).finally(() => {
        updateInProgressRef.current = false
      })
    }

    const interval = setInterval(persistOrders, PENDING_TWAP_UPDATE_INTERVAL)

    persistOrders()

    return () => clearInterval(interval)
  }, [chainId, safeAddress, composableCowContract])

  return ordersSafeData
}
