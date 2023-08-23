import { useCallback } from 'react'

import { Currency, CurrencyAmount } from '@uniswap/sdk-core'

import { Nullish } from 'types'

import { useTradeUSDValues } from 'modules/fiatAmount'
import { useWalletInfo } from 'modules/wallet'

import { usePrice } from 'common/hooks/usePrice'
import { useSafeMemo, useSafeMemoObject } from 'common/hooks/useSafeMemo'
import { RateInfoParams } from 'common/pure/RateInfo'
import tryParseCurrencyAmount from 'lib/utils/tryParseCurrencyAmount'

export function useRateInfoParams(
  inputCurrencyAmount: Nullish<CurrencyAmount<Currency>>,
  outputCurrencyAmount: Nullish<CurrencyAmount<Currency>>
): RateInfoParams {
  const { chainId } = useWalletInfo()

  const activeRate = usePrice(inputCurrencyAmount, outputCurrencyAmount)

  const parseRate = useCallback(
    (invert: boolean) => {
      if (!activeRate || activeRate.denominator.toString() === '0' || activeRate.numerator.toString() === '0') return

      return (invert ? activeRate.invert() : activeRate).toSignificant(18)
    },
    [activeRate]
  )

  const tradeAmounts = useSafeMemo(
    () => ({
      inputAmount: tryParseCurrencyAmount(parseRate(true), inputCurrencyAmount?.currency || undefined),
      outputAmount: tryParseCurrencyAmount(parseRate(false), outputCurrencyAmount?.currency || undefined),
    }),
    [inputCurrencyAmount, outputCurrencyAmount]
  )

  const {
    inputAmount: { value: invertedActiveRateFiatAmount },
    outputAmount: { value: activeRateFiatAmount },
  } = useTradeUSDValues(tradeAmounts)

  return useSafeMemoObject({
    chainId,
    inputCurrencyAmount,
    outputCurrencyAmount,
    activeRateFiatAmount,
    invertedActiveRateFiatAmount,
  })
}
