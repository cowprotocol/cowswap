import { useMemo } from 'react'
import { OrderKind } from '@cowprotocol/cow-sdk'
import { useLimitOrdersFullState } from './useLimitOrdersFullState'

export function useTypedValue() {
  const { inputCurrencyAmount, outputCurrencyAmount, orderKind } = useLimitOrdersFullState()

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
