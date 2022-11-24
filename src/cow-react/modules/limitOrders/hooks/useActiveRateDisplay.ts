import { useAtomValue } from 'jotai/utils'
import { limitRateAtom } from '@cow/modules/limitOrders/state/limitRateAtom'
import { useHigherUSDValue } from 'hooks/useStablecoinPrice'
import tryParseCurrencyAmount from 'lib/utils/tryParseCurrencyAmount'
import { useLimitOrdersTradeState } from '@cow/modules/limitOrders/hooks/useLimitOrdersTradeState'
import { useCallback } from 'react'
import { useWeb3React } from '@web3-react/core'
import { useSafeMemoObject } from '@cow/common/hooks/useSafeMemo'
import { RateInfoParams } from '@cow/common/pure/RateInfo'

export function useActiveRateDisplay(): RateInfoParams {
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
