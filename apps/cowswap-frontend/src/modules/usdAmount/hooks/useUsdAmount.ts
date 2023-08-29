import { Currency, CurrencyAmount, Token } from '@uniswap/sdk-core'

import { Nullish } from 'types'

import { useSafeMemo } from 'common/hooks/useSafeMemo'
import { currencyAmountToTokenAmount } from 'utils/currencyAmountToTokenAmount'

import { useUsdPrice } from './useUsdPrice'

export interface UsdAmountInfo {
  value: CurrencyAmount<Token> | null
  isLoading: boolean
}

const DEFAULT_USD_AMOUNT_STATE = { value: null, isLoading: true }

export function useUsdAmount(_amount: Nullish<CurrencyAmount<Currency>>): UsdAmountInfo {
  const amount = currencyAmountToTokenAmount(_amount)
  const usdcPrice = useUsdPrice(amount?.currency)

  return useSafeMemo(() => {
    if (!usdcPrice || !amount) return DEFAULT_USD_AMOUNT_STATE

    const { price, isLoading } = usdcPrice

    return {
      value: price === null ? null : price.quote(amount),
      isLoading,
    }
  }, [usdcPrice, amount])
}
