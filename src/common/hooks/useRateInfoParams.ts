import { useCallback } from 'react'

import { Currency, CurrencyAmount } from '@uniswap/sdk-core'

import { Nullish } from 'types'

import { useHigherUSDValue } from 'legacy/hooks/useStablecoinPrice'

import { useWalletInfo } from 'modules/wallet'

import { usePrice } from 'common/hooks/usePrice'
import { useSafeMemoObject } from 'common/hooks/useSafeMemo'
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

  const activeRateFiatAmount = useHigherUSDValue(
    tryParseCurrencyAmount(parseRate(false), outputCurrencyAmount?.currency || undefined)
  ).value

  const invertedActiveRateFiatAmount = useHigherUSDValue(
    tryParseCurrencyAmount(parseRate(true), inputCurrencyAmount?.currency || undefined)
  ).value

  return useSafeMemoObject({
    chainId,
    inputCurrencyAmount,
    outputCurrencyAmount,
    activeRateFiatAmount,
    invertedActiveRateFiatAmount,
  })
}
