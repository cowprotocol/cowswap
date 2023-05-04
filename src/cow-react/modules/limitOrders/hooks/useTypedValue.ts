import { useMemo } from 'react'
import { OrderKind } from '@cowprotocol/cow-sdk'
import { useLimitOrdersDerivedState } from './useLimitOrdersDerivedState'

export function useTypedValue() {
  const { inputCurrencyAmount, outputCurrencyAmount, orderKind } = useLimitOrdersDerivedState()

  const typedValue = useMemo(() => {
    if (orderKind === OrderKind.SELL) {
      return inputCurrencyAmount
    } else if (orderKind === OrderKind.BUY) {
      return outputCurrencyAmount
    } else {
      return undefined
    }
  }, [inputCurrencyAmount, orderKind, outputCurrencyAmount])

  return { typedValue, exactTypedValue: typedValue?.toExact() }
}
