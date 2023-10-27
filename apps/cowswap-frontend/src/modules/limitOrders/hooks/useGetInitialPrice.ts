import { useEffect, useState } from 'react'

import { useIsWindowVisible } from '@cowprotocol/common-hooks'
import { getAddress, getIsNativeToken } from '@cowprotocol/common-utils'
import { useWalletInfo } from '@cowprotocol/wallet'
import { Currency, Fraction } from '@uniswap/sdk-core'

import * as Sentry from '@sentry/browser'
import ms from 'ms.macro'
import { useAsyncMemo } from 'use-async-memo'

import { useLimitOrdersDerivedState } from 'modules/limitOrders/hooks/useLimitOrdersDerivedState'
import { parsePrice } from 'modules/limitOrders/utils/parsePrice'

import { getNativePrice } from 'api/gnosisProtocol'

type PriceResult = number | Error | undefined

const PRICE_UPDATE_INTERVAL = ms`10sec`

async function requestPriceForCurrency(chainId: number | undefined, currency: Currency | null): Promise<PriceResult> {
  const currencyAddress = getAddress(currency)

  if (!chainId || !currency) {
    return
  }

  try {
    if (getIsNativeToken(currency) || !currencyAddress) {
      return parsePrice(1, currency)
    }

    const result = await getNativePrice(chainId, currencyAddress)

    if (!result) {
      throw new Error('No result from native_price endpoint')
    }

    const price = parsePrice(result.price || 0, currency)
    if (!price) {
      throw new Error("Couldn't parse native_price result")
    }

    return price
  } catch (error: any) {
    console.warn('[requestPriceForCurrency] Error fetching native_price', error)

    const sentryError = Object.assign(error, {
      message: error.message || 'Error fetching native_price ',
      name: 'NativePriceFetchError',
    })

    const params = {
      chainId,
      tokenAddress: currencyAddress,
      tokenName: currency?.name,
      tokenSymbol: currency.symbol,
    }

    Sentry.captureException(sentryError, {
      contexts: {
        params,
      },
    })

    return error
  }
}

export async function requestPrice(
  chainId: number | undefined,
  inputCurrency: Currency | null,
  outputCurrency: Currency | null
): Promise<Fraction | null> {
  return Promise.all([
    requestPriceForCurrency(chainId, inputCurrency),
    requestPriceForCurrency(chainId, outputCurrency),
  ]).then(([inputPrice, outputPrice]) => {
    if (!inputPrice || !outputPrice || inputPrice instanceof Error || outputPrice instanceof Error) {
      return null
    }

    const result = new Fraction(inputPrice, outputPrice)

    console.debug('Updated limit orders initial price: ', result.toSignificant(18))

    return result
  })
}

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
    null
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

  return { price, isLoading }
}
