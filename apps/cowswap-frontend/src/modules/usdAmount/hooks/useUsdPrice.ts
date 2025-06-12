import { useAtomValue, useSetAtom } from 'jotai'
import { useEffect, useMemo } from 'react'

import { Token } from '@uniswap/sdk-core'

import { Nullish } from 'types'

import { useSafeEffect } from 'common/hooks/useSafeMemo'

import { addCurrencyToUsdPriceQueue, removeCurrencyToUsdPriceFromQueue } from '../state/usdRawPricesAtom'
import { UsdPriceState, usdTokenPricesAtom } from '../state/usdTokenPricesAtom'
import { UsdPriceStateKey } from '../types'
import { getUsdPriceStateKey } from '../utils/usdPriceStateKey'

/**
 * Subscribe to USD price for a single currency and returns the USD price state
 */
export function useUsdPrice(currency: Nullish<Token>): UsdPriceState | null {
  const key = currency && getUsdPriceStateKey(currency)

  const usdPrices = useAtomValue(usdTokenPricesAtom)
  const addCurrencyToUsdPrice = useSetAtom(addCurrencyToUsdPriceQueue)
  const removeCurrencyToUsdPrice = useSetAtom(removeCurrencyToUsdPriceFromQueue)

  useSafeEffect(() => {
    if (currency) {
      addCurrencyToUsdPrice(currency)
    }

    return () => {
      if (currency) {
        removeCurrencyToUsdPrice(currency)
      }
    }
  }, [currency])

  if (!key) return null

  const price = usdPrices[key]

  if (!price || price.currency.chainId !== currency?.chainId) return null

  return price
}

/**
 * Subscribe to USD prices for multiple currencies, returns void
 */
function useSubscribeUsdPrices(currencies: Token[]): void {
  const addCurrencyToUsdPrice = useSetAtom(addCurrencyToUsdPriceQueue)
  const removeCurrencyToUsdPrice = useSetAtom(removeCurrencyToUsdPriceFromQueue)

  useEffect(() => {
    // Avoid subscribing to the same currency multiple times
    const seenCurrencies = new Set<string>()

    currencies.forEach((currency) => {
      if (seenCurrencies.has(currency?.address?.toLowerCase())) {
        return
      }

      addCurrencyToUsdPrice(currency)
      seenCurrencies.add(currency?.address?.toLowerCase())
    })

    return () => {
      currencies.forEach((currency) => {
        if (seenCurrencies.has(currency?.address?.toLowerCase())) {
          removeCurrencyToUsdPrice(currency)
          seenCurrencies.delete(currency?.address?.toLowerCase())
        }
      })
    }
  }, [currencies, addCurrencyToUsdPrice, removeCurrencyToUsdPrice])
}

/**
 * Subscribe to USD prices for multiple currencies and returns the USD prices state
 */
export function useUsdPrices(currencies: Token[]): Record<UsdPriceStateKey, UsdPriceState | null> {
  useSubscribeUsdPrices(currencies)
  const usdPrices = useAtomValue(usdTokenPricesAtom)

  return useMemo(
    () =>
      currencies.reduce<Record<UsdPriceStateKey, UsdPriceState | null>>((acc, currency) => {
        const key = getUsdPriceStateKey(currency)

        acc[key] = usdPrices[key] || null

        return acc
      }, {}),
    [currencies, usdPrices],
  )
}
