import { useEffect, useState } from 'react'
import { Currency, Fraction } from '@uniswap/sdk-core'
import { useAsyncMemo } from 'use-async-memo'

import { useLimitOrdersTradeState } from '@cow/modules/limitOrders/hooks/useLimitOrdersTradeState'
import { getAddress } from '@cow/utils/getAddress'
import ms from 'ms.macro'
import { parsePrice } from '@cow/modules/limitOrders/utils/parsePrice'
import useIsWindowVisible from 'hooks/useIsWindowVisible'
import { useWalletInfo } from '@cow/modules/wallet'
import { getNativePrice } from '@cow/api/gnosisProtocol'
import { ApiError } from '@cowprotocol/cow-sdk'
import * as Sentry from '@sentry/browser'

type ErrorWithApiError = { errorType: string; description: string; rawApiError: ApiError }
type PriceResult = number | Error | undefined | ErrorWithApiError

function hasApiError(value: any): value is ErrorWithApiError {
  return value && typeof value === 'object' && value.errorType && value.description && value.rawApiError
}

const PRICE_UPDATE_INTERVAL = ms`10sec`

async function requestPriceForCurrency(chainId: number | undefined, currency: Currency | null): Promise<PriceResult> {
  const currencyAddress = getAddress(currency)

  if (!chainId || !currency) {
    return
  }

  try {
    if (currency.isNative || !currencyAddress) {
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
    if (
      !inputPrice ||
      !outputPrice ||
      inputPrice instanceof Error ||
      outputPrice instanceof Error ||
      hasApiError(inputPrice) ||
      hasApiError(outputPrice)
    ) {
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
  const { inputCurrency, outputCurrency } = useLimitOrdersTradeState()
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
