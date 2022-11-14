import { useAtomValue } from 'jotai/utils'
import { limitRateAtom } from '@cow/modules/limitOrders/state/limitRateAtom'
import { useHigherUSDValue } from 'hooks/useStablecoinPrice'
import tryParseCurrencyAmount from 'lib/utils/tryParseCurrencyAmount'
import { useLimitOrdersTradeState } from '@cow/modules/limitOrders/hooks/useLimitOrdersTradeState'
import { useMemo } from 'react'
import { Currency, CurrencyAmount, Fraction } from '@uniswap/sdk-core'

export interface ActiveRateDisplay {
  inputActiveRateCurrency: Currency | null
  outputActiveRateCurrency: Currency | null
  currentActiveRate: Fraction | null
  currentActiveRateFiatAmount: CurrencyAmount<Currency> | null
}

export function useActiveRateDisplay(): ActiveRateDisplay {
  const { inputCurrency, outputCurrency } = useLimitOrdersTradeState()
  const { isInversed, activeRate } = useAtomValue(limitRateAtom)

  const inputActiveRateCurrency = isInversed ? outputCurrency : inputCurrency
  const outputActiveRateCurrency = isInversed ? inputCurrency : outputCurrency

  const currentActiveRate = useMemo(() => {
    if (!activeRate) return null
    return isInversed ? activeRate.invert() : activeRate
  }, [isInversed, activeRate])

  const currentActiveRateFiatAmount = useHigherUSDValue(
    tryParseCurrencyAmount(currentActiveRate?.toSignificant(16), outputActiveRateCurrency || undefined)
  )

  return {
    inputActiveRateCurrency,
    outputActiveRateCurrency,
    currentActiveRate,
    currentActiveRateFiatAmount,
  }
}
