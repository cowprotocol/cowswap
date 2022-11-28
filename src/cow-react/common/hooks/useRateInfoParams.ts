import { useHigherUSDValue } from 'hooks/useStablecoinPrice'
import tryParseCurrencyAmount from 'lib/utils/tryParseCurrencyAmount'
import { useCallback } from 'react'
import { useWeb3React } from '@web3-react/core'
import { useSafeMemo, useSafeMemoObject } from '@cow/common/hooks/useSafeMemo'
import { RateInfoParams } from '@cow/common/pure/RateInfo'
import { Currency, CurrencyAmount, Price } from '@uniswap/sdk-core'

export function useRateInfoParams(
  inputCurrencyAmount: CurrencyAmount<Currency> | null,
  outputCurrencyAmount: CurrencyAmount<Currency> | null
): RateInfoParams {
  const { chainId } = useWeb3React()

  const activeRate = useSafeMemo(() => {
    if (!outputCurrencyAmount || !inputCurrencyAmount) return null
    return new Price({ baseAmount: inputCurrencyAmount, quoteAmount: outputCurrencyAmount })
  }, [inputCurrencyAmount, outputCurrencyAmount])

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
