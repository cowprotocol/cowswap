import { useEffect, useState } from 'react'
import { useWeb3React } from '@web3-react/core'
import { Currency, Fraction } from '@uniswap/sdk-core'
import { useAsyncMemo } from 'use-async-memo'

import { getNativePrice } from '@cow/api/gnosisProtocol/api'
import { useLimitOrdersTradeState } from '@cow/modules/limitOrders/hooks/useLimitOrdersTradeState'
import { getAddress } from '@cow/utils/getAddress'
import ms from 'ms.macro'
import { parsePrice } from '@cow/modules/limitOrders/utils/parsePrice'

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
      throw new Error('Cannot parse initial price')
    }

    const price = parsePrice(result.price, currency)

    if (!price) {
      throw new Error('Cannot parse initial price')
    }

    return price
  } catch (error: any) {
    return error
  }
}

async function requestPrice(
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
  const { chainId } = useWeb3React()
  const { inputCurrency, outputCurrency } = useLimitOrdersTradeState()
  const [isLoading, setIsLoading] = useState(false)
  const [updateTimestamp, setUpdateTimestamp] = useState(Date.now())

  const price = useAsyncMemo(
    () => {
      setIsLoading(true)

      return requestPrice(chainId, inputCurrency, outputCurrency).finally(() => {
        setIsLoading(false)
      })
    },
    [chainId, inputCurrency, outputCurrency, updateTimestamp],
    null
  )

  // Update initial price every 10 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      setUpdateTimestamp(Date.now())
    }, PRICE_UPDATE_INTERVAL)

    return () => clearInterval(interval)
  }, [])

  return { price, isLoading }
}
