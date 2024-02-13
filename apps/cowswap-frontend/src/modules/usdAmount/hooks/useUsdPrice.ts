import { useAtomValue, useSetAtom } from 'jotai'

import { Token } from '@uniswap/sdk-core'

import { Nullish } from 'types'

import { useSafeEffect } from 'common/hooks/useSafeMemo'

import { addCurrencyToUsdPriceQueue, removeCurrencyToUsdPriceFromQueue } from '../state/usdRawPricesAtom'
import { usdTokenPricesAtom, UsdPriceState } from '../state/usdTokenPricesAtom'

export function useUsdPrice(currency: Nullish<Token>): UsdPriceState | null {
  const currencyAddress = currency?.address?.toLowerCase()

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

  if (!currencyAddress) return null

  const price = usdPrices[currencyAddress]

  if (!price || price.currency.chainId !== currency?.chainId) return null

  return price
}
