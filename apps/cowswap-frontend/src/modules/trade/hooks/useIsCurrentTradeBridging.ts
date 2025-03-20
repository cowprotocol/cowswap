import { useDerivedTradeState } from './useDerivedTradeState'

export function useIsCurrentTradeBridging() {
  const derivedTradeState = useDerivedTradeState()

  return derivedTradeState?.inputCurrency?.chainId !== derivedTradeState?.outputCurrency?.chainId
}
