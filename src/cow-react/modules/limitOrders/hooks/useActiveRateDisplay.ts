import { useAtomValue } from 'jotai/utils'
import { limitRateAtom } from '@cow/modules/limitOrders/state/limitRateAtom'
import { useHigherUSDValue } from 'hooks/useStablecoinPrice'
import tryParseCurrencyAmount from 'lib/utils/tryParseCurrencyAmount'
import { useLimitOrdersTradeState } from '@cow/modules/limitOrders/hooks/useLimitOrdersTradeState'
import { Currency, CurrencyAmount, Fraction } from '@uniswap/sdk-core'

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

  const activeRateFiatAmount = useHigherUSDValue(
    tryParseCurrencyAmount(activeRate?.toSignificant(18), outputCurrency || undefined)
  )

  const inversedActiveRateFiatAmount = useHigherUSDValue(
    tryParseCurrencyAmount(activeRate?.invert().toSignificant(18), inputCurrency || undefined)
  )

  return {
    inputCurrency,
    outputCurrency,
    activeRate,
    activeRateFiatAmount,
    inversedActiveRateFiatAmount,
  }
}
