import { isFractionFalsy } from '@cowprotocol/common-utils'
import { Currency, CurrencyAmount } from '@uniswap/sdk-core'

import { Nullish } from 'types'

import { useIsWrapOrUnwrap } from 'modules/trade/hooks/useIsWrapOrUnwrap'

import { UsdAmountInfo, useUsdAmount } from './useUsdAmount'

export interface TradeUSDAmounts {
  inputAmount: UsdAmountInfo
  outputAmount: UsdAmountInfo
}

export function useTradeUsdAmounts(
  inputAmount: Nullish<CurrencyAmount<Currency>>,
  outputAmount: Nullish<CurrencyAmount<Currency>>
): TradeUSDAmounts {
  const isWrapOrUnwrap = useIsWrapOrUnwrap()
  const isTradeReady = !isWrapOrUnwrap && !isFractionFalsy(inputAmount) && !isFractionFalsy(outputAmount)

  return {
    inputAmount: useUsdAmount(isTradeReady ? inputAmount : null),
    outputAmount: useUsdAmount(isTradeReady ? outputAmount : null),
  }
}
