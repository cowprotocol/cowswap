import { useEffect, useState } from 'react'

import { useIsWindowVisible } from '@cowprotocol/common-hooks'
import { getWrappedToken } from '@cowprotocol/common-utils'
import { useWalletInfo } from '@cowprotocol/wallet'
import { Currency, Fraction } from '@uniswap/sdk-core'

import ms from 'ms.macro'
import { useAsyncMemo } from 'use-async-memo'

import { useLimitOrdersDerivedState } from 'modules/limitOrders/hooks/useLimitOrdersDerivedState'

import { useSafeMemo } from 'common/hooks/useSafeMemo'

import { fetchCurrencyUsdPrice, usdcPriceLoader } from '../../usdAmount'

const PRICE_UPDATE_INTERVAL = ms`10sec`

export async function requestPrice(
  chainId: number | undefined,
  inputCurrency: Currency | null,
  outputCurrency: Currency | null,
): Promise<Fraction | null> {
  if (!chainId || !inputCurrency || !outputCurrency) {
    return null
  }

  const inputToken = getWrappedToken(inputCurrency)
  const outputToken = getWrappedToken(outputCurrency)

  // Only needed for the fallback CoW price, which needs to know the USDC price
  const getUsdPrice = usdcPriceLoader(chainId)

  return Promise.all([
    fetchCurrencyUsdPrice(inputToken, getUsdPrice),
    fetchCurrencyUsdPrice(outputToken, getUsdPrice),
  ]).then(([inputPrice, outputPrice]) => {
    if (!inputPrice || !outputPrice) {
      return null
    }

    const result = inputPrice.divide(outputPrice)

    console.debug('Updated limit orders initial price: ', result.toSignificant(18))

    return result
  })
}

// Fetches the INPUT and OUTPUT price and calculates initial Active rate
// When return null it means we failed on price loading
export function useGetInitialPrice(): { price: Fraction | null; isLoading: boolean } {
  const { chainId } = useWalletInfo()
  const { inputCurrency, outputCurrency } = useLimitOrdersDerivedState()
  const [isLoading, setIsLoading] = useState(false)
  const [updateTimestamp, setUpdateTimestamp] = useState(Date.now())
  const isWindowVisible = useIsWindowVisible()

  const price = useAsyncMemo(
    async () => {
      setIsLoading(true)

      console.debug('[useGetInitialPrice] Fetching price')
      try {
        return await requestPrice(chainId, inputCurrency, outputCurrency)
      } finally {
        setIsLoading(false)
      }
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
