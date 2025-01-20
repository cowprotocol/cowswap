import { useEffect, useState } from 'react'

import { getWrappedToken } from '@cowprotocol/common-utils'
import { Fraction } from '@uniswap/sdk-core'

import { useAsyncMemo } from 'use-async-memo'

import { useLimitOrdersDerivedState } from 'modules/limitOrders/hooks/useLimitOrdersDerivedState'

import { useSafeMemo } from 'common/hooks/useSafeMemo'

import { useUsdPrice } from '../../usdAmount'

// Fetches the INPUT and OUTPUT price and calculates initial Active rate
// When return null it means we failed on price loading
export function useGetInitialPrice(): { price: Fraction | null; isLoading: boolean } {
  const { inputCurrency, outputCurrency } = useLimitOrdersDerivedState()
  const [isLoading, setIsLoading] = useState(false)

  const inputToken = inputCurrency && getWrappedToken(inputCurrency)
  const outputToken = outputCurrency && getWrappedToken(outputCurrency)
  const inputUsdPrice = useUsdPrice(inputToken)
  const outputUsdPrice = useUsdPrice(outputToken)

  useEffect(() => {
    setIsLoading(!!inputUsdPrice?.isLoading || !!outputUsdPrice?.isLoading)
  }, [inputUsdPrice?.isLoading, outputUsdPrice?.isLoading])

  const price = useAsyncMemo(
    async () => {
      console.debug('[useGetInitialPrice] Fetching price')
      if (!inputUsdPrice?.price || !outputUsdPrice?.price) {
        return null
      }

      return inputUsdPrice.price.asFraction.divide(outputUsdPrice.price.asFraction)
    },
    [inputUsdPrice?.price, outputUsdPrice?.price],
    null,
  )

  return useSafeMemo(() => ({ price, isLoading }), [price, isLoading])
}
