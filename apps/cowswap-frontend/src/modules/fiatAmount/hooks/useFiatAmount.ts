import { useMemo } from 'react'

import { Currency, CurrencyAmount, Token } from '@uniswap/sdk-core'

import { Nullish } from 'types'

import { currencyAmountToTokenAmount } from 'utils/currencyAmountToTokenAmount'

import { useUsdcPrice } from './useUsdcPrice'

export interface FiatAmountInfo {
  value: CurrencyAmount<Token> | null
  isLoading: boolean
}

const defaultFiatAmountState = { value: null, isLoading: false }

export function useFiatAmount(_amount: Nullish<CurrencyAmount<Currency>>): FiatAmountInfo {
  const amount = currencyAmountToTokenAmount(_amount)
  const usdcPrice = useUsdcPrice(amount?.currency)

  return useMemo(() => {
    if (!usdcPrice || !amount) return defaultFiatAmountState

    if (usdcPrice.price === null) {
      return { value: usdcPrice.price, isLoading: usdcPrice.isLoading }
    }

    return {
      value: usdcPrice.price.quote(amount),
      isLoading: false,
    }
  }, [usdcPrice, amount])
}
