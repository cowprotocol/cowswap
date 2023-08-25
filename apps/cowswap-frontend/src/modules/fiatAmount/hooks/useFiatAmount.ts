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

    const { price, isLoading } = usdcPrice

    return {
      value: price === null ? null : price.quote(amount),
      isLoading,
    }
  }, [usdcPrice, amount])
}
