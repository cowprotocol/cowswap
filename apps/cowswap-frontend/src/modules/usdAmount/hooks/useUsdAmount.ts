import { TokenWithLogo } from '@cowprotocol/common-const'
import { currencyAmountToTokenAmount } from '@cowprotocol/common-utils'
import { Currency, CurrencyAmount, Token } from '@uniswap/sdk-core'

import { Nullish } from 'types'

import { useSafeMemo } from 'common/hooks/useSafeMemo'

import { useUsdPrice } from './useUsdPrice'

export interface UsdAmountInfo {
  value: CurrencyAmount<Token> | null
  isLoading: boolean
}

const DEFAULT_USD_AMOUNT_STATE = { value: null, isLoading: false }

export function useUsdAmount(
  _amount: Nullish<CurrencyAmount<Currency>>,
  currency?: Nullish<TokenWithLogo>
): UsdAmountInfo {
  const amount = useSafeMemo(() => (_amount ? currencyAmountToTokenAmount(_amount) : null), [_amount])
  const usdcPrice = useUsdPrice(amount?.currency || currency)

  return useSafeMemo(() => {
    if (!usdcPrice) return DEFAULT_USD_AMOUNT_STATE

    const { price, isLoading } = usdcPrice

    return {
      value: price === null || !amount ? null : price.quote(amount),
      isLoading,
    }
  }, [usdcPrice, amount, currency])
}
