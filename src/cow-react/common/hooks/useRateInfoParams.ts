import { useHigherUSDValue } from 'hooks/useStablecoinPrice'
import tryParseCurrencyAmount from 'lib/utils/tryParseCurrencyAmount'
import { useCallback } from 'react'
import { useSafeMemoObject } from '@cow/common/hooks/useSafeMemo'
import { RateInfoParams } from '@cow/common/pure/RateInfo'
import { Currency, CurrencyAmount } from '@uniswap/sdk-core'
import { usePrice } from '@cow/common/hooks/usePrice'
import { useWalletInfo } from '@cow/modules/wallet'

export function useRateInfoParams(
  inputCurrencyAmount: CurrencyAmount<Currency> | null,
  outputCurrencyAmount: CurrencyAmount<Currency> | null
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
  )

  const invertedActiveRateFiatAmount = useHigherUSDValue(
    tryParseCurrencyAmount(parseRate(true), inputCurrencyAmount?.currency || undefined)
  )

  return useSafeMemoObject({
    chainId,
    inputCurrencyAmount,
    outputCurrencyAmount,
    activeRateFiatAmount,
    invertedActiveRateFiatAmount,
  })
}
