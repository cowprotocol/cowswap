import { useCallback, useState } from 'react'

import { Currency, Fraction } from '@uniswap/sdk-core'

import * as Sentry from '@sentry/browser'
import ms from 'ms.macro'

import { useLimitOrdersDerivedState } from 'modules/limitOrders/hooks/useLimitOrdersDerivedState'
import { parsePrice } from 'modules/limitOrders/utils/parsePrice'
import { useWalletInfo } from 'modules/wallet'

import { getNativePrice } from 'api/gnosisProtocol'
import { useInterval } from 'common/hooks/useInterval'
import { getAddress } from 'utils/getAddress'

type PriceResult = number | Error | undefined

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

  const [price, setPrice] = useState<Fraction | null>(null)

  const fetchPrice = useCallback(() => {
    setIsLoading(true)
    requestPrice(chainId, inputCurrency, outputCurrency)
      .then(setPrice)
      .finally(() => {
        setIsLoading(false)
      })
  }, [chainId, inputCurrency, outputCurrency])

  useInterval({
    callback: fetchPrice,
    name: 'useGetInitialPrice',
    delay: PRICE_UPDATE_INTERVAL,
    triggerEagerly: true,
  })

  return { price, isLoading }
}
