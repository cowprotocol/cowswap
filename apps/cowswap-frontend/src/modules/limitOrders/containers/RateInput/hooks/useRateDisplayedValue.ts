import { useAtomValue } from 'jotai'
import { useMemo } from 'react'

import { formatInputAmount, tryParseCurrencyAmount } from '@cowprotocol/common-utils'
import { Currency } from '@uniswap/sdk-core'

import { useUsdAmount } from 'modules/usdAmount'

import { useLimitOrdersDerivedState } from '../../../hooks/useLimitOrdersDerivedState'
import { limitRateAtom } from '../../../state/limitRateAtom'

export function useRateDisplayedValue(currency: Currency | null, isUsdMode: boolean): string {
  const { isInverted, activeRate, typedValue, isTypedValue } = useAtomValue(limitRateAtom)
  const { inputCurrency, outputCurrency } = useLimitOrdersDerivedState()
  const areBothCurrencies = !!inputCurrency && !!outputCurrency

  const rawRate = useMemo(() => {
    if (isTypedValue) return typedValue || ''

    if (!activeRate || !areBothCurrencies || activeRate.equalTo(0)) return ''

    const rate = isInverted ? activeRate.invert() : activeRate

    return formatInputAmount(rate)
  }, [activeRate, areBothCurrencies, isInverted, isTypedValue, typedValue])

  const rateAsCurrencyAmount = !currency || !rawRate ? null : tryParseCurrencyAmount(rawRate, currency)

  const { value: rateAsUsdAmount } = useUsdAmount(rateAsCurrencyAmount)

  if (isUsdMode) {
    return formatInputAmount(rateAsUsdAmount)
  }

  return rawRate
}
