import { useMemo } from 'react'

import { TokenWithLogo } from '@cowprotocol/common-const'
import { isFractionFalsy } from '@cowprotocol/common-utils'
import { Currency, CurrencyAmount } from '@uniswap/sdk-core'

import { Nullish } from 'types'

import { useIsWrapOrUnwrap } from 'modules/trade/hooks/useIsWrapOrUnwrap'

import { useSafeMemo } from 'common/hooks/useSafeMemo'

import { UsdAmountInfo, useUsdAmount } from './useUsdAmount'

export interface TradeUSDAmounts {
  inputAmount: UsdAmountInfo
  outputAmount: UsdAmountInfo
}

/**
 * Returns USD amounts for trade input and output
 * USD amount needs two things to be calculated:
 *  - Token amount
 *  - Token price in USD
 * If you want to start loading token prices in USD before token amount is ready, you can pass inputCurrency and outputCurrency
 * One case when we need it is price impact calculation
 */
export function useTradeUsdAmounts(
  inputAmount: Nullish<CurrencyAmount<Currency>>,
  outputAmount: Nullish<CurrencyAmount<Currency>>,
  inputCurrency?: Nullish<TokenWithLogo>,
  outputCurrency?: Nullish<TokenWithLogo>,
  dontWaitBothAmounts?: boolean
): TradeUSDAmounts {
  const isWrapOrUnwrap = useIsWrapOrUnwrap()
  const areAmountsReady = !isFractionFalsy(inputAmount) && !isFractionFalsy(outputAmount)
  const isTradeReady = !isWrapOrUnwrap && (dontWaitBothAmounts || areAmountsReady)

  const [useUsdAmountInputParams, useUsdAmountOutputParams] = useSafeMemo(() => {
    const useUsdAmountInputParams: Parameters<typeof useUsdAmount> = isWrapOrUnwrap
      ? [null, null] // disable usd estimation when it's wrap/unwrap
      : [isTradeReady ? inputAmount : null, inputCurrency]
    const useUsdAmountOutputParams: Parameters<typeof useUsdAmount> = isWrapOrUnwrap
      ? [null, null]
      : [isTradeReady ? outputAmount : null, outputCurrency]

    return [useUsdAmountInputParams, useUsdAmountOutputParams]
  }, [isWrapOrUnwrap, isTradeReady, inputAmount, outputAmount, inputCurrency, outputCurrency])

  const usdInputAmount = useUsdAmount(...useUsdAmountInputParams)
  const usdOutputAmount = useUsdAmount(...useUsdAmountOutputParams)

  return useMemo(
    () => ({ inputAmount: usdInputAmount, outputAmount: usdOutputAmount }),
    [usdInputAmount, usdOutputAmount]
  )
}
