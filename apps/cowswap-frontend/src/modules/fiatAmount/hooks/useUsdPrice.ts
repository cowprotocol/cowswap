import { useAtomValue, useSetAtom } from 'jotai'

import { Token } from '@uniswap/sdk-core'

import { Nullish } from 'types'

import { useSafeEffect, useSafeMemo } from 'common/hooks/useSafeMemo'

import { addCurrencyToFiatPriceQueue, removeCurrencyToFiatPriceFromQueue } from '../state/fiatPricesAtom'
import { usdPricesAtom, UsdPriceState } from '../state/usdPricesAtom'

export function useUsdPrice(currency: Nullish<Token>): UsdPriceState | null {
  const currencyAddress = currency?.address?.toLowerCase()

  const usdPrices = useAtomValue(usdPricesAtom)
  const addCurrencyToFiatPrice = useSetAtom(addCurrencyToFiatPriceQueue)
  const removeCurrencyToFiatPrice = useSetAtom(removeCurrencyToFiatPriceFromQueue)

  useSafeEffect(() => {
    if (currency) {
      addCurrencyToFiatPrice(currency)
    }

    return () => {
      if (currency) {
        removeCurrencyToFiatPrice(currency)
      }
    }
  }, [currency])

  return useSafeMemo(() => {
    if (!currencyAddress) return null

    return usdPrices[currencyAddress] || null
  }, [usdPrices, currencyAddress])
}
