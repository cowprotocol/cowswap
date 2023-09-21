import { useCallback } from 'react'

import { tryParseCurrencyAmount } from '@cowprotocol/common-utils'
import { useWalletInfo } from '@cowprotocol/wallet'
import { Currency, CurrencyAmount } from '@uniswap/sdk-core'

import { Nullish } from 'types'

import { useTradeUsdAmounts } from 'modules/usdAmount'

import { usePrice } from 'common/hooks/usePrice'
import { useSafeMemoObject } from 'common/hooks/useSafeMemo'
import { RateInfoParams } from 'common/pure/RateInfo'

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

  const {
    inputAmount: { value: invertedActiveRateFiatAmount },
    outputAmount: { value: activeRateFiatAmount },
  } = useTradeUsdAmounts(
    tryParseCurrencyAmount(parseRate(true), inputCurrencyAmount?.currency || undefined),
    tryParseCurrencyAmount(parseRate(false), outputCurrencyAmount?.currency || undefined)
  )

  return useSafeMemoObject({
    chainId,
    inputCurrencyAmount,
    outputCurrencyAmount,
    activeRateFiatAmount,
    invertedActiveRateFiatAmount,
  })
}
