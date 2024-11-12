import { useEffect, useState } from 'react'

import { useIsWindowVisible } from '@cowprotocol/common-hooks'
import { useWalletInfo } from '@cowprotocol/wallet'
import { Fraction } from '@uniswap/sdk-core'

import ms from 'ms.macro'
import { useAsyncMemo } from 'use-async-memo'

import { useLimitOrdersDerivedState } from 'modules/limitOrders/hooks/useLimitOrdersDerivedState'

import { useSafeMemo } from 'common/hooks/useSafeMemo'
import { requestPrice } from 'common/services/requestPrice'

const PRICE_UPDATE_INTERVAL = ms`10sec`

// Fetches the INPUT and OUTPUT price and calculates initial Active rate
// When return null it means we failed on price loading
// TODO: rename it to useNativeBasedPrice
export function useGetInitialPrice(): { price: Fraction | null; isLoading: boolean } {
  const { chainId } = useWalletInfo()
  const { inputCurrency, outputCurrency } = useLimitOrdersDerivedState()
  const [isLoading, setIsLoading] = useState(false)
  const [updateTimestamp, setUpdateTimestamp] = useState(Date.now())
  const isWindowVisible = useIsWindowVisible()

  const price = useAsyncMemo(
    () => {
      setIsLoading(true)

      console.debug('[useGetInitialPrice] Fetching price')
      return requestPrice(chainId, inputCurrency, outputCurrency).finally(() => {
        setIsLoading(false)
      })
    },
    [chainId, inputCurrency, outputCurrency, updateTimestamp],
    null,
  )

  // Update initial price every 10 seconds
  useEffect(() => {
    if (!isWindowVisible) {
      console.debug('[useGetInitialPrice] No need to fetch quotes')
      return
    }

    console.debug('[useGetInitialPrice] Periodically fetch price')
    const interval = setInterval(() => {
      setUpdateTimestamp(Date.now())
    }, PRICE_UPDATE_INTERVAL)

    return () => clearInterval(interval)
  }, [isWindowVisible])

  return useSafeMemo(() => ({ price, isLoading }), [price, isLoading])
}
