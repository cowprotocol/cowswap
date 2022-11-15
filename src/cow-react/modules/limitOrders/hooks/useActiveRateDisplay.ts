import { useAtomValue } from 'jotai/utils'
import { limitRateAtom } from '@cow/modules/limitOrders/state/limitRateAtom'
import { useHigherUSDValue } from 'hooks/useStablecoinPrice'
import tryParseCurrencyAmount from 'lib/utils/tryParseCurrencyAmount'
import { useLimitOrdersTradeState } from '@cow/modules/limitOrders/hooks/useLimitOrdersTradeState'
import { Currency, CurrencyAmount, Fraction } from '@uniswap/sdk-core'
import { useCallback } from 'react'

export interface ActiveRateDisplay {
  inputCurrency: Currency | null
  outputCurrency: Currency | null
  activeRate: Fraction | null
  activeRateFiatAmount: CurrencyAmount<Currency> | null
  inversedActiveRateFiatAmount: CurrencyAmount<Currency> | null
}

export function useActiveRateDisplay(): ActiveRateDisplay {
  const { inputCurrency, outputCurrency } = useLimitOrdersTradeState()
  const { activeRate } = useAtomValue(limitRateAtom)

  const parseRate = useCallback(
    (invert: boolean) => {
      if (!activeRate || activeRate.denominator.toString() === '0' || activeRate.numerator.toString() === '0') return
      if (invert) return activeRate?.invert().toSignificant(18)
      else return activeRate?.toSignificant(18)
    },
    [activeRate]
  )

  const activeRateFiatAmount = useHigherUSDValue(tryParseCurrencyAmount(parseRate(false), outputCurrency || undefined))

  const inversedActiveRateFiatAmount = useHigherUSDValue(
    tryParseCurrencyAmount(parseRate(true), inputCurrency || undefined)
  )

  return {
    inputCurrency,
    outputCurrency,
    activeRate,
    activeRateFiatAmount,
    inversedActiveRateFiatAmount,
  }
}
