import { useAtomValue, useSetAtom } from 'jotai'

import { Token } from '@uniswap/sdk-core'

import { Nullish } from 'types'

import { useSafeEffect, useSafeMemo } from 'common/hooks/useSafeMemo'

import { addCurrencyToFiatPriceQueue, removeCurrencyToFiatPriceFromQueue } from '../state/fiatPricesAtom'
import { usdcPricesAtom, UsdcPriceState } from '../state/usdcPricesAtom'

export function useUsdcPrice(currency: Nullish<Token>): UsdcPriceState | null {
  const currencyAddress = currency?.address?.toLowerCase()

  const usdcPrices = useAtomValue(usdcPricesAtom)
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

    return usdcPrices[currencyAddress] || null
  }, [usdcPrices, currencyAddress])
}
