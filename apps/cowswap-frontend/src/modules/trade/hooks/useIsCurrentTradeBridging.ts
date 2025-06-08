import { useDerivedTradeState } from './useDerivedTradeState'

// TODO: Add proper return type annotation
// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
export function useIsCurrentTradeBridging() {
  const derivedTradeState = useDerivedTradeState()

  return derivedTradeState?.inputCurrency?.chainId !== derivedTradeState?.outputCurrency?.chainId
}
