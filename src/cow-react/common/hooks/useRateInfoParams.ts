import { useHigherUSDValue } from 'hooks/useStablecoinPrice'
import tryParseCurrencyAmount from 'lib/utils/tryParseCurrencyAmount'
import { useCallback, useMemo } from 'react'
import { useWeb3React } from '@web3-react/core'
import { useSafeMemoObject } from '@cow/common/hooks/useSafeMemo'
import { RateInfoParams } from '@cow/common/pure/RateInfo'
import { Currency, CurrencyAmount, Fraction } from '@uniswap/sdk-core'

export function useRateInfoParams(
  inputCurrencyAmount: CurrencyAmount<Currency> | null,
  outputCurrencyAmount: CurrencyAmount<Currency> | null
): RateInfoParams {
  const { chainId } = useWeb3React()

  const activeRate = useMemo(() => {
    if (!outputCurrencyAmount?.quotient || !inputCurrencyAmount?.quotient) return null

    return new Fraction(outputCurrencyAmount.quotient, inputCurrencyAmount.quotient)
  }, [outputCurrencyAmount?.quotient, inputCurrencyAmount?.quotient])

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

  const inversedActiveRateFiatAmount = useHigherUSDValue(
    tryParseCurrencyAmount(parseRate(true), inputCurrencyAmount?.currency || undefined)
  )

  return useSafeMemoObject({
    chainId,
    inputCurrencyAmount,
    outputCurrencyAmount,
    activeRateFiatAmount,
    inversedActiveRateFiatAmount,
  })
}
