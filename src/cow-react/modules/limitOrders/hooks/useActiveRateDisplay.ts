import { useAtomValue } from 'jotai/utils'
import { limitRateAtom } from '@cow/modules/limitOrders/state/limitRateAtom'
import { useHigherUSDValue } from 'hooks/useStablecoinPrice'
import tryParseCurrencyAmount from 'lib/utils/tryParseCurrencyAmount'
import { useLimitOrdersTradeState } from '@cow/modules/limitOrders/hooks/useLimitOrdersTradeState'
import { Currency, CurrencyAmount, Fraction } from '@uniswap/sdk-core'
import { useCallback } from 'react'
import { SupportedChainId } from 'constants/chains'
import { useWeb3React } from '@web3-react/core'
import { useSafeMemoObject } from '@cow/common/hooks/useSafeMemo'

export interface ActiveRateDisplay {
  chainId: SupportedChainId | undefined
  inputCurrencyAmount: CurrencyAmount<Currency> | null
  outputCurrencyAmount: CurrencyAmount<Currency> | null
  activeRate: Fraction | null
  activeRateFiatAmount: CurrencyAmount<Currency> | null
  inversedActiveRateFiatAmount: CurrencyAmount<Currency> | null
}

export function useActiveRateDisplay(): ActiveRateDisplay {
  const { chainId } = useWeb3React()
  const { inputCurrencyAmount, outputCurrencyAmount } = useLimitOrdersTradeState()
  const { activeRate } = useAtomValue(limitRateAtom)

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
    activeRate,
    activeRateFiatAmount,
    inversedActiveRateFiatAmount,
  })
}
